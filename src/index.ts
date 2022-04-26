import { Context, Schema } from "koishi";
import moment from "moment";

export interface UserFavorProfile {
  favor: number;
  lastSignTime: Date;
}

declare module "koishi" {
  interface User {
    favorProfile: UserFavorProfile;
  }
}

export interface Config {
  signCooldown: number;
  signIncrement: number;
}

export const Config = Schema.object({
  signCooldown: Schema.natural().description("签到间隔（秒）。").default(86400),
  signIncrement: Schema.natural().description("签到增加的好感度。").default(10),
});

export default class FavorPlugin {
  getCooldown(profile: UserFavorProfile) {
    if (!profile.lastSignTime) return 0;
    const cooldown =
      this.config.signCooldown - moment().diff(profile.lastSignTime, "seconds");
    if (cooldown < 0) return 0;
    return cooldown;
  }

  constructor(private ctx: Context, private config: Config) {
    ctx.model.extend("user", {
      "favorProfile.favor": { type: "unsigned", initial: 0 },
      "favorProfile.lastSignTime": { type: "date" },
    });
    ctx
      .command("favor", "当前好感度")
      .userFields(["favorProfile"])
      .action(
        async ({ session }) =>
          `您当前的好感度是 ${session.user.favorProfile.favor} 。`
      );
    ctx
      .command("sign", "签到")
      .usage(`每 ${config.signCooldown} 秒只能签到一次。`)
      .userFields(["favorProfile"])
      .action(async ({ session }) => {
        const cooldown = this.getCooldown(session.user.favorProfile);
        if (cooldown > 0)
          return `您已经签到过了。您还需要等待 ${cooldown} 秒才能继续签到。`;
        session.user.favorProfile.favor += this.config.signIncrement;
        session.user.favorProfile.lastSignTime = new Date();
        return `签到成功！好感度 +${this.config.signIncrement}`;
      });
  }

  static Config = Config;
  static using = ["database"] as const;
}
