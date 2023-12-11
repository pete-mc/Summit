/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

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
    new CopyPlugin({
      patterns: [
        { from: Path.resolve(__dirname, "bin"), to: Path.resolve(__dirname, "cordova-app/www/bin") },
        { from: Path.resolve(__dirname, "styles"), to: Path.resolve(__dirname, "cordova-app/www/styles") },
      ],
    }),
  ],
};