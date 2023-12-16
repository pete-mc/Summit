const Webpack = require("webpack");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: 'inline-source-map',
  plugins: [
    new Webpack.DefinePlugin({
      "process.env.SUMMITBUILD": JSON.stringify('dev'),
    }),
  ]
});