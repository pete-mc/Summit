/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
module.exports = merge(common, {
  mode: "development",
  devtool: 'source-map',
});

