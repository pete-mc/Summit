/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');


module.exports = {
  entry: "./src/summitStart.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
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
    new WebpackShellPluginNext({
      onBuildEnd:{
        scripts: [
          'mkdir -p ./cordova-app/platforms/android/platform_www/bin',
          'mkdir -p ./cordova-app/platforms/android/platform_www/styles',
          'cp -r ./bin ./cordova-app/platforms/android/platform_www/bin',
          'cp -r ./styles ./cordova-app/platforms/android/platform_www/styles'
        ],
        blocking: true,
        parallel: false
      }
    }),
  ],
};