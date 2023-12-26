/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const shell = require("shelljs");
// const rimraf = require('rimraf');

module.exports = {
  entry: "./src/summitStart.ts",
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
    filename: "summit.js",
    path: Path.resolve(__dirname, "bin"),
  },
  plugins: [
    new Webpack.DefinePlugin({
      "process.env.SUMMITVERSION": JSON.stringify(require("./manifest.json").version),
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          "node -e \"require('shelljs').mkdir('-p', '../cordova-app/www/bin')\"",
          "node -e \"require('shelljs').mkdir('-p', '../cordova-app/www/styles')\"",
          "node -e \"require('shelljs').cp('-R', './bin/*', '../cordova-app/www/bin')\"",
          "node -e \"require('shelljs').cp('-R', './styles/*', '../cordova-app/www/styles')\"",
        ],
        blocking: true,
        parallel: false,
      },
    }),
  ],
};
