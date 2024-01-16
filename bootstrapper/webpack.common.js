// eslint-disable-next-line @typescript-eslint/no-var-requires
const Path = require("path");

module.exports = {
  entry: "./src/summit-bootstrap.ts",
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
    filename: "summit-bootstrap.js",
    path: Path.resolve(__dirname, "bin"),
  },
};
