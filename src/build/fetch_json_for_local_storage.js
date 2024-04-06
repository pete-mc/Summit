/**
 * A webpack plugin that fetches JSON data from a specified URL
 * and adds it to the compilation as a stringified JSON variable.
 */
class FetchJsonWebpackPlugin {
  constructor(options) {
    this.url = options.url;
    this.variableName = options.variableName;
    this.outputFile = options.outputFile;
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise("FetchJsonWebpackPlugin", async (compilation) => {
      // Fetch JSON data from the URL
      const response = await fetch(this.url);
      const data = await response.json();

      // Add the data to the compilation as a stringified JSON variable
      const content = `localStorage.setItem("${this.variableName}",JSON.stringify(${JSON.stringify(data)}))`;

      // Add the variable to the output assets
      compilation.assets[this.outputFile] = {
        source: () => content,
        size: () => content.length,
      };
    });
  }
}

module.exports = FetchJsonWebpackPlugin;
