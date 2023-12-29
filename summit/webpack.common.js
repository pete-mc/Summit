/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const shell = require("shelljs");
const xml2js = require("xml2js");
const version = require("../bootstrapper/manifest.json").version;
const fs = require("fs");
// const rimraf = require('rimraf');
fs.readFile("../cordova-app/config.xml", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }

  // Parse XML to JS Obj
  xml2js.parseString(data, function (err, result) {
    if (err) {
      return console.log(err);
    }

    // Set widget.$.version to version from manifest.json
    result.widget.$.version = version;

    // Build XML from JS Obj
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(result);

    // Write config.xml
    fs.writeFile("../cordova-app/config.xml", xml, function (err) {
      if (err) {
        return console.log(err);
      }
    });
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
