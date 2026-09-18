// @zumer/snapdom ships only ESM (package.json "exports" resolves to dist/snapdom.mjs), which
// Jest's ts-jest transform (scoped to .ts/.tsx only) can't parse. Any test that merely imports
// something from gridExport.ts — even exportGridToExcel/exportGridToPdf, which don't use
// SnapDOM — pulls in gridExport's top-level `import { snapdom } from "@zumer/snapdom"` and fails
// before the test body runs. This stub is wired in via jest.config.js's moduleNameMapper so that
// import resolves to something Jest can parse; tests that actually exercise exportElementToPdf
// override it per-file with their own jest.mock("@zumer/snapdom", ...) for real assertions.
export const snapdom = {
  toCanvas: async (): Promise<HTMLCanvasElement> => document.createElement("canvas"),
};
