import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const HOME_TS_PATH = path.resolve(REPO_ROOT, "src/pages/Home/Home.ts");
const HOME_VUE_PATH = path.resolve(REPO_ROOT, "src/pages/Home/Home.vue");
const SUMMIT_LOADER_PATH = path.resolve(REPO_ROOT, "src/summitloader.js");

describe("Home version display contract", () => {
  it("passes extension version through loader DOM contract and renders it in Home view", () => {
    const homeTsSource = fs.readFileSync(HOME_TS_PATH, "utf8");
    const homeVueSource = fs.readFileSync(HOME_VUE_PATH, "utf8");
    const summitLoaderSource = fs.readFileSync(SUMMIT_LOADER_PATH, "utf8");

    expect(homeTsSource).toContain("summit_version");
    expect(homeTsSource).toContain("summitVersionFromDom");
    expect(homeTsSource).toContain("data-summit-version");
    expect(homeTsSource).toContain("this.summit_version");
    expect(homeTsSource).not.toContain("chromeApi");

    expect(summitLoaderSource).toContain("getManifest");
    expect(summitLoaderSource).toContain("data-summit-version");
    expect(summitLoaderSource).toContain("setAttribute");

    expect(homeVueSource).toContain("v-if=\"summit_version\"");
    expect(homeVueSource).toContain("Current version:");
    expect(homeVueSource).toContain("{{ summit_version }}");
  });
});
