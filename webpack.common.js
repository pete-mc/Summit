/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
// const shell = require('shelljs');
// const rimraf = require('rimraf');

module.exports = {
  entry: "./src/summitStart.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/, /summitTerrainContext.ts/],
      }
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
      onBuildEnd:{
        scripts: [
          'mkdir -p ./cordova-app/www/bin',
          'mkdir -p ./cordova-app/www/styles',
          'cp -r ./bin ./cordova-app/www',
          'cp -r ./styles ./cordova-app/www'
        ],
        blocking: true,
        parallel: false
      }
    }),
  ],
};