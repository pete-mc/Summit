/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");

module.exports = {
  entry: "./src/summitStart.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: [/node_modules/],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|eot|ttf|otf|webp)$/,
        use: { loader: "url-loader", options: { limit: 10240000 } },
        exclude: [/node_modules/],
      },
      {
        test: /\.(txt|html|csv)$/,
        type: "asset/source",
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
      "process.env.SUMMITVERSION": JSON.stringify(require("./package.json").version),
    }),
    new Webpack.BannerPlugin({
      banner: `Welcome to Terrian | Summit, go to https://github.com/pete-mc/summit for more information
      Summit Version: ${JSON.stringify(require("./package.json").version)}`,
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          "node -e \"require('shelljs').cp('-R', './bin/*', '../bootstrapper/src')\"",
          "node -e \"require('shelljs').cp('-R', './styles/*', './bin')\"",
          "node -e \"require('shelljs').cp('-R', './package.json', './bin')\"",
          "node -e \"require('shelljs').cp('-R', './README.md', './bin')\"",
          "node -e \"require('shelljs').cp('-R', './LICENSE', './bin')\"",
        ],
        blocking: true,
        parallel: false,
      },
    }),
  ],
};
