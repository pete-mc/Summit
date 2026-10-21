import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { ADDITIONAL_AWARD_KEYS, BADGE_MANIFEST, getBadgeEntry, normaliseBadgeKey } from "@/shared/badgeManifest";

const REPO_ROOT = resolve(__dirname, "../../..");
const IMAGES_DIR = resolve(REPO_ROOT, "src/images");
const TERRAIN_BUNDLE_DIR = resolve(REPO_ROOT, "docs/terrain.scouts.com.au/_nuxt");

/** Learning: the check that matters. Keys guessed from filenames broke the camper awards while every other test passed. */
function readTerrainAdditionalAwardIds(): string[] {
  const appBundle = readdirSync(TERRAIN_BUNDLE_DIR).find((name) => /^app\..*\.js$/.test(name));
  if (!appBundle) {
    throw new Error(`No app.*.js found in ${TERRAIN_BUNDLE_DIR} — the captured Terrain bundle is the source of truth for award ids and must be present.`);
  }

  const source = readFileSync(resolve(TERRAIN_BUNDLE_DIR, appBundle), "utf8");

  // Gotcha: filter(), not [...new Set()], which compiles to [] here (ES5) and would pass for the wrong reason.
  const MARKER = "./additional-award-badges/";

  return source
    .split(MARKER)
    .slice(1)
    .map((chunk) => chunk.split(".svg")[0])
    .filter((id) => /^[a-z0-9_]+$/.test(id))
    .filter((id, index, all) => all.indexOf(id) === index)
    .sort();
}

describe("badge manifest", () => {
  it("points every declared artwork file at a file that actually exists on disk", () => {
    // A typo'd filename 404s silently in the browser: no error, just an empty cell.
    const missing = Object.entries(BADGE_MANIFEST)
      .filter(([, entry]) => entry.file !== null)
      .filter(([, entry]) => !existsSync(resolve(IMAGES_DIR, entry.file as string)))
      .map(([key, entry]) => `${key} -> ${entry.file}`);

    expect(missing).toEqual([]);
  });

  it("matches Terrain's own additional-award ids exactly, in both directions", () => {
    const terrainIds = readTerrainAdditionalAwardIds();

    expect(terrainIds.length).toBeGreaterThan(20);

    expect([...ADDITIONAL_AWARD_KEYS].sort()).toEqual(terrainIds);
  });

  it("gives every badge a non-empty label, so an unfilled row is still identifiable", () => {
    const unlabelled = Object.entries(BADGE_MANIFEST)
      .filter(([, entry]) => !entry.label.trim())
      .map(([key]) => key);

    expect(unlabelled).toEqual([]);
  });

  it("does not point two badges at the same artwork file", () => {
    const files = Object.values(BADGE_MANIFEST)
      .map((entry) => entry.file)
      .filter((file): file is string => file !== null);

    expect(files.length).toBe(new Set(files).size);
  });

  it("uses already-normalised keys, so every entry is reachable through getBadgeEntry()", () => {
    const unreachable = Object.keys(BADGE_MANIFEST).filter((key) => normaliseBadgeKey(key) !== key);

    expect(unreachable).toEqual([]);
  });

  it("exposes every artwork folder through manifest.json, so no badge 404s silently", () => {
    // A bundled but not web-accessible file fails silently.
    const extensionManifest = JSON.parse(readFileSync(resolve(REPO_ROOT, "manifest.json"), "utf8"));
    const exposed: string[] = extensionManifest.web_accessible_resources.flatMap((entry: { resources: string[] }) => entry.resources);

    const folders = Object.values(BADGE_MANIFEST)
      .map((entry) => entry.file)
      .filter((file): file is string => file !== null)
      .map((file) => file.split("/")[0])
      .filter((folder, index, all) => all.indexOf(folder) === index);

    folders.forEach((folder) => {
      const covered = exposed.some((pattern) => pattern === "images/*" || pattern === `images/${folder}/*`);
      expect(covered).toBe(true);
    });
  });

  it("covers the five sections for milestones (3 stages each) and peak awards", () => {
    const sections = ["joey", "cub", "scout", "venturer", "rover"];

    sections.forEach((section) => {
      [1, 2, 3].forEach((stage) => {
        expect(BADGE_MANIFEST[`milestone_${section}_${stage}`]).toBeDefined();
      });
      expect(BADGE_MANIFEST[`peak_award_${section}`]).toBeDefined();
    });
  });

  it("resolves a known badge and returns null for an unknown one", () => {
    expect(getBadgeEntry("camper_award_10")?.file).toBe("aawards/aawards-camperaward-10.svg");
    expect(getBadgeEntry("Walkabout-100")?.file).toBe("aawards/aawards-walkabout-100.svg");
    expect(getBadgeEntry("not_a_real_badge")).toBeNull();
    expect(getBadgeEntry("")).toBeNull();
  });

  it("reports artwork coverage, so the remaining gap is visible rather than discovered on the page", () => {
    const total = Object.keys(BADGE_MANIFEST).length;
    const withArtwork = Object.values(BADGE_MANIFEST).filter((entry) => entry.file !== null).length;

    // eslint-disable-next-line no-console
    console.log(`Badge artwork coverage: ${withArtwork}/${total} (${total - withArtwork} awaiting artwork)`);

    expect(withArtwork).toBeGreaterThan(0);
    expect(withArtwork).toBeLessThanOrEqual(total);
  });
});
