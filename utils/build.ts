import path from "path";
import webpack, { WebpackPluginInstance } from "webpack";
import ZipPlugin from "zip-webpack-plugin";
import packageInfo from "../package.json";
import config from "../webpack.config";

config.mode = "production";

config.plugins?.push(
  new ZipPlugin({
    filename: `${packageInfo.name}-${packageInfo.version}.zip`,
    path: path.join(__dirname, "../", "zip"),
  }) as unknown as WebpackPluginInstance,
);

webpack(config, function (err) {
  if (err) {
    throw err;
  }
});
