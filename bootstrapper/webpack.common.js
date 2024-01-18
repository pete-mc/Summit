// eslint-disable-next-line @typescript-eslint/no-var-requires
const Path = require("path");
const Webpack = require("webpack");

module.exports = {
  entry: "./src/summit-bootstrap.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
      {
        resourceQuery: /raw/,
        type: "asset/source",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "summit-bootstrap.js",
    path: Path.resolve(__dirname, "bin"),
  },
  plugins: [
    new Webpack.DefinePlugin({
      "process.env.SUMMITVERSION": JSON.stringify(require("./manifest.json").version),
    }),
  ],
};
