/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const Path = require("path");
const fs = require("fs");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    new Webpack.DefinePlugin({
      "process.env.SUMMITBUILD": JSON.stringify("dev"),
    }),
  ],
  devServer: {
    static: {
      directory: Path.join(__dirname, "dist"),
    },
    allowedHosts: "all",
    host: "localhost",
    compress: true,
    port: 443,
    server: {
      type: "https",
      options: {
        key: fs.readFileSync("./certs/cert.key"),
        cert: fs.readFileSync("./certs/cert.crt"),
        ca: fs.readFileSync("./certs/ca.crt"),
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
