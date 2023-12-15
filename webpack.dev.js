/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: 'inline-source-map',
  output: {
    devtoolModuleFilenameTemplate: 'TerrainSummit:///[resource-path]?[hash]'
  }
});