import * as fs from "fs";
import * as path from "path";

describe("build pipeline contract", () => {
  it("preserves extension manifest script/style artifact paths", () => {
    const manifestPath = path.resolve(__dirname, "../../../manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      content_scripts: Array<{ js: string[]; css: string[] }>;
      web_accessible_resources: Array<{ resources: string[] }>;
    };

    const contentScript = manifest.content_scripts[0];
    expect(contentScript.js).toContain("/scripts/summitloader.js");
    expect(contentScript.css).toContain("/styles/summit.css");
    expect(contentScript.css).toContain("/styles/fluent.min.css");

    const resources = manifest.web_accessible_resources[0]?.resources ?? [];
    expect(resources).toContain("scripts/summit.js");
  });

  it("keeps webpack output and copied assets aligned to extension contract", async () => {
    const webpackConfigModule = await import(path.resolve(__dirname, "../../../webpack.config.js"));
    const webpackConfig = (webpackConfigModule.default ?? webpackConfigModule) as {
      output: { filename: string };
      plugins: Array<{ constructor: { name: string }; options?: { filename?: string; patterns?: Array<{ from: string; to?: string }> } }>;
    };

    expect(webpackConfig.output.filename).toBe("scripts/summit.js");

    const miniCssPlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === "MiniCssExtractPlugin");
    expect(miniCssPlugin?.options?.filename).toBe("styles/summit.css");

    const copyPlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === "CopyPlugin") as { patterns?: Array<{ from: string; to?: string }> } | undefined;
    const patterns = copyPlugin?.patterns ?? [];
    expect(patterns).toEqual(
      expect.arrayContaining([expect.objectContaining({ from: "manifest.json" }), expect.objectContaining({ from: "src/summitloader.js", to: "scripts" }), expect.objectContaining({ from: "src/styles/fluent.min.css", to: "styles" })]),
    );
  });

  it("supports overriding dev-server port while keeping secure default", async () => {
    process.env.SUMMIT_DEV_SERVER_PORT = "8443";
    jest.resetModules();

    const webpackConfigModule = await import(path.resolve(__dirname, "../../../webpack.config.js"));
    const webpackConfig = (webpackConfigModule.default ?? webpackConfigModule) as {
      devServer?: { port?: number };
    };

    expect(webpackConfig.devServer?.port).toBe(8443);

    delete process.env.SUMMIT_DEV_SERVER_PORT;
    jest.resetModules();
    const webpackConfigDefaultModule = await import(path.resolve(__dirname, "../../../webpack.config.js"));
    const webpackConfigDefault = (webpackConfigDefaultModule.default ?? webpackConfigDefaultModule) as {
      devServer?: { port?: number };
    };

    expect(webpackConfigDefault.devServer?.port).toBe(443);
  });

  it("pins build-tooling dependencies to refreshed in-major releases", () => {
    const packageJsonPath = path.resolve(__dirname, "../../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
      devDependencies?: Record<string, string>;
    };

    const devDependencies = packageJson.devDependencies ?? {};

    expect(devDependencies["@babel/core"]).toBe("^7.29.0");
    expect(devDependencies["@babel/preset-env"]).toBe("^7.29.2");
    expect(devDependencies["@babel/preset-react"]).toBe("^7.28.5");
    expect(devDependencies["@babel/preset-typescript"]).toBe("^7.28.5");
    expect(devDependencies["babel-loader"]).toBe("^9.2.1");
    expect(devDependencies["copy-webpack-plugin"]).toBe("^14.0.0");
    expect(devDependencies["css-loader"]).toBe("^6.11.0");
    expect(devDependencies["css-minimizer-webpack-plugin"]).toBe("^8.0.0");
    expect(devDependencies["mini-css-extract-plugin"]).toBe("^2.10.2");
    expect(devDependencies.webpack).toBe("^5.106.2");
    expect(devDependencies["webpack-dev-server"]).toMatch(/^\^5\./);
  });
});
