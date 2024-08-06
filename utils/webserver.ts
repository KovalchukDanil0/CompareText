import path from "path";
import webpack, { EntryObject } from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "../webpack.config";
import env from "./env";

const notHotReload = ["background", "contentScript", "devtools"];

for (const entryName in config.entry as EntryObject) {
  if (notHotReload.includes(entryName)) {
    (config.entry as EntryObject)[entryName] = [
      "webpack/hot/dev-server",
      `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`,
      (config.entry as EntryObject)[entryName] as string,
    ];
  }
}

const compiler = webpack(config);

const server = new WebpackDevServer(
  {
    https: false,
    hot: true,
    liveReload: false,
    client: {
      webSocketTransport: "sockjs",
    },
    webSocketServer: "sockjs",
    host: "localhost",
    port: env.PORT,
    static: {
      directory: path.join(__dirname, "../build"),
    },
    devMiddleware: {
      publicPath: `http://localhost:${env.PORT}/`,
      writeToDisk: true,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    allowedHosts: "all",
  },
  compiler,
);

(async () => {
  await server.start();
})();
