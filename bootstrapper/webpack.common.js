/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const shell = require("shelljs");
// const rimraf = require('rimraf');

module.exports = {
  entry: "./src/summit-bootstrap.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
      {
        resourceQuery: /raw/,
        type: "asset/source",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "summit-bootstrap.js",
    path: Path.resolve(__dirname, "bin"),
  },
  plugins: [
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          "node -e \"require('shelljs').mkdir('-p', '../cordova-app/www/bin')\"",
          "node -e \"require('shelljs').mkdir('-p', '../cordova-app/www/styles')\"",
          "node -e \"require('shelljs').cp('-R', './bin/*', '../cordova-app/www/bin')\"",
          "node -e \"require('shelljs').cp('-R', './styles/*', '../cordova-app/www/styles')\"",
          "node -e \"require('shelljs').cp('-R', './bin/*', '../npm')\"",
          "node -e \"require('shelljs').cp('-R', '../README.md', '../npm')\"",
        ],
        blocking: true,
        parallel: false,
      },
    }),
  ],
};
