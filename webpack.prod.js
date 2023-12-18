/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new Webpack.DefinePlugin({
      "process.env.SUMMITBUILD": JSON.stringify("prod"),
    }),
  ],
});
