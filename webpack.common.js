/* eslint-disable @typescript-eslint/no-var-requires */
const Webpack = require("webpack");
const Path = require("path");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');


module.exports = {
  entry: "./src/summitStart.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/, /summitTerrainContext.ts/],
      }
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
    new WebpackShellPluginNext({
      onBuildStart:{
        scripts: [
          'npx tsc src/summitTerrainContext.ts --outDir src',
        ]
      },      
      onBuildEnd:{
        scripts: [
          'mkdir -p ./cordova-app/www/bin',
          'mkdir -p ./cordova-app/www/styles',
          'cp -r ./bin ./cordova-app/www',
          'cp -r ./styles ./cordova-app/www'
        ],
        blocking: true,
        parallel: false
      }
    }),
  ],
};