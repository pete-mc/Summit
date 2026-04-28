import * as fs from "fs";
import * as path from "path";

type RenderContract = {
  file: string;
  mustContain: string[];
};

type Phase1Contracts = {
  baselineRenderContracts: RenderContract[];
};

const REPO_ROOT = path.resolve(__dirname, "../../..");
const CONTRACTS_PATH = path.resolve(REPO_ROOT, "plans/remove-syncfusion-phase-1-contracts.json");

describe("baseline page/component render contracts", () => {
  it("captures current Syncfusion-backed render markers for key pages", () => {
    expect(fs.existsSync(CONTRACTS_PATH)).toBe(true);

    const contracts = JSON.parse(fs.readFileSync(CONTRACTS_PATH, "utf8")) as Phase1Contracts;

    for (const contract of contracts.baselineRenderContracts) {
      const absoluteFilePath = path.resolve(REPO_ROOT, contract.file);
      expect(fs.existsSync(absoluteFilePath)).toBe(true);

      const source = fs.readFileSync(absoluteFilePath, "utf8");
      for (const marker of contract.mustContain) {
        expect(source).toContain(marker);
      }
    }
  });
});
