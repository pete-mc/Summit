/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const shell = require("shelljs");
const xml2js = require("xml2js");
const version = require("../bootstrapper/manifest.json").version;
const fs = require("fs");

//set version in ../cordova-app/config.xml to the version from manifest.json
fs.readFile("../cordova-app/config.xml", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }
  xml2js.parseString(data, function (err, result) {
    if (err) return console.log(err);
    result.widget.$.version = version;
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(result);
    fs.writeFile("../cordova-app/config.xml", xml, function (err) {
      if (err) return console.log(err);
    });
  });
});

//set version in ../npm/package.json to the version from manifest.json
fs.readFile("../npm/package.json", "utf8", function (err, data) {
  if (err) return console.log(err);
  const manifest = JSON.parse(data);
  manifest.version = version;
  const json = JSON.stringify(manifest, null, 2);
  fs.writeFile("../npm/package.json", json, function (err) {
    if (err) return console.log(err);
  });
});

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
      "process.env.SUMMITVERSION": JSON.stringify(require("../bootstrapper/manifest.json").version),
    }),
    new Webpack.BannerPlugin({
      banner: `Welcome to Terrian | Summit, go to https://github.com/pete-mc/summit for more information
      Summit Version: ${JSON.stringify(require("../bootstrapper/manifest.json").version)}`,
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ["node -e \"require('shelljs').cp('-R', './bin/*', '../bootstrapper/src')\""],
        blocking: true,
        parallel: false,
      },
    }),
  ],
};
