const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require("webpack-shell-plugin-next");
const shell = require("shelljs");
const xml2js = require("xml2js");
const version = require("../bootstrapper/manifest.json").version;
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require('vue-loader');


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
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        exclude: /node_modules|docs/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|eot|ttf|otf|webp)$/,
        use: { loader: "url-loader", options: { limit: 10240000 } },
        exclude: /node_modules|docs/,
      },
      {
        test: /\.(txt|html|csv)$/,
        type: "asset/source",
        exclude: /node_modules|docs/,
      },
    ],
  },
  // externals: {
  //   vue: 'Vue',
  //   'vue-router': 'VueRouter',
  //   vuex: 'Vuex'
  // },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "summit.js",
    path: Path.resolve(__dirname, "dist"),
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: "summit.css", // Specify the output CSS filename
    }),
  ],
};
