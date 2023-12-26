/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const shell = require("shelljs");
// const rimraf = require('rimraf');

module.exports = {
  entry: "./src/summitTerrainContext.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "summitTerrainContext.js",
    path: Path.resolve(__dirname, "bin"),
  },
  plugins: [
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ["node -e \"require('shelljs').mkdir('-p', '../browser-extension/src/content')\"", "node -e \"require('shelljs').cp('-R', './bin/*', '../browser-extension/src/content')\""],
        blocking: true,
        parallel: false,
      },
    }),
  ],
};
