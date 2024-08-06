import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import fileSystem from "fs-extra";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import ReactRefreshTypeScript from "react-refresh-typescript";
import TerserPlugin from "terser-webpack-plugin";
import { Configuration, EnvironmentPlugin, ProgressPlugin } from "webpack";
import pkg from "./package.json";
import { ConfigurationModeType } from "./src/shared";
import env from "./utils/env";

const ASSET_PATH = process.env.ASSET_PATH || "/";

const alias: { secrets?: string } = {};

// load the secrets
const secretsPath = path.join(__dirname, `secrets.${env.NODE_ENV}.js`);

const fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2",
];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

const isDevelopment = process.env.NODE_ENV !== "production";
const isChrome = process.env.BROWSER === "chrome";

const backgroundPageName = "background.bundle.js";

const config: Configuration = {
  mode: (process.env.NODE_ENV || "development") as ConfigurationModeType,
  entry: {
    popup: path.join(__dirname, "src", "pages", "Popup", "index.tsx"),
    background: path.join(__dirname, "src", "pages", "Background", "index.ts"),
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
    publicPath: ASSET_PATH,
  },
  module: {
    rules: [
      {
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                ident: "postcss",
                plugins: ["tailwindcss", "autoprefixer"],
              },
            },
          },
        ],
        test: /\.(css|scss)$/,
      },
      {
        test: new RegExp(`.(${fileExtensions.join("|")})$`),
        type: "asset/resource",
        exclude: /node_modules/,
        // loader: 'file-loader',
        // options: {
        //   name: '[name].[ext]',
        // },
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              getCustomTransformers: () => ({
                before: [isDevelopment && ReactRefreshTypeScript()].filter(
                  Boolean,
                ),
              }),
              transpileOnly: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: "source-map-loader",
          },
          {
            loader: "babel-loader",
            options: {
              plugins: [isDevelopment && "react-refresh/babel"].filter(Boolean),
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias,
    extensions: fileExtensions
      .map((extension) => "." + extension)
      .concat([".js", ".jsx", ".ts", ".tsx", ".css"]),
  },
  plugins: [
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new CleanWebpackPlugin({ verbose: false }),
    new ProgressPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: path.join(__dirname, "build"),
          force: true,
          transform(content) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: pkg.description,
                version: pkg.version,
                homepage_url: pkg.repository.url,
                background: isChrome
                  ? { service_worker: backgroundPageName }
                  : { page: backgroundPageName },
                ...JSON.parse(content.toString()),
              }),
            );
          },
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets/img/icon-16.png",
          to: path.join(__dirname, "build"),
          force: true,
        },
        {
          from: "src/assets/img/icon-32.png",
          to: path.join(__dirname, "build"),
          force: true,
        },
        {
          from: "src/assets/img/icon-64.png",
          to: path.join(__dirname, "build"),
          force: true,
        },
        {
          from: "src/assets/img/icon-128.png",
          to: path.join(__dirname, "build"),
          force: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "pages", "Popup", "index.html"),
      filename: "popup.html",
      chunks: ["popup"],
      cache: false,
    }),
  ].filter(Boolean),
  infrastructureLogging: {
    level: "info",
  },
  devtool: isDevelopment ? "cheap-module-source-map" : undefined,
  optimization: !isDevelopment
    ? {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            extractComments: false,
          }),
        ],
      }
    : undefined,
};

export default config;
