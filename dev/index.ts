import { App } from "koishi";
import FavorPlugin from "../src";
import ConsolePlugin from "@koishijs/plugin-console";
import SandboxPlugin from "@koishijs/plugin-sandbox";
import * as DatabasePlugin from "@koishijs/plugin-database-memory";

const app = new App({
  port: 3000,
  host: "localhost",
  prefix: ".",
});

app.plugin(SandboxPlugin);
app.plugin(ConsolePlugin, {
  open: false,
});

app.plugin(DatabasePlugin);
app.plugin(FavorPlugin, {
  signCooldown: 60,
  signIncrement: 1,
});

app.start();
