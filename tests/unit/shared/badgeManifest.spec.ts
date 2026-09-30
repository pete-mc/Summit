import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { ADDITIONAL_AWARD_KEYS, BADGE_MANIFEST, getBadgeEntry, normaliseBadgeKey } from "@/shared/badgeManifest";

const REPO_ROOT = resolve(__dirname, "../../..");
const IMAGES_DIR = resolve(REPO_ROOT, "src/images");
const TERRAIN_BUNDLE_DIR = resolve(REPO_ROOT, "docs/terrain.scouts.com.au/_nuxt");

/**
 * The additional-award ids Terrain itself ships artwork for, read from the asset map in its
 * bundled app.*.js ("./additional-award-badges/<id>.svg").
 *
 * This is the check that matters. The manifest's keys must come from Terrain's data, not from our
 * own artwork filenames — guessing them from filenames is exactly what broke the camper awards
 * (keyed "camping_10" when Terrain sends "camper_award_10"), and every unit test passed while the
 * page silently showed blank placeholders. A structural table does not prevent that; comparing
 * against the real reference does.
 */
function readTerrainAdditionalAwardIds(): string[] {
  const appBundle = readdirSync(TERRAIN_BUNDLE_DIR).find((name) => /^app\..*\.js$/.test(name));
  if (!appBundle) {
    throw new Error(`No app.*.js found in ${TERRAIN_BUNDLE_DIR} — the captured Terrain bundle is the source of truth for award ids and must be present.`);
  }

  const source = readFileSync(resolve(TERRAIN_BUNDLE_DIR, appBundle), "utf8");

  // Parsed by splitting on the asset-map marker rather than with one regex over the whole file,
  // and de-duplicated with filter() rather than a Set: this project targets ES5 without
  // downlevelIteration, so spreading a Set ([...new Set(x)]) compiles to an empty array and
  // silently loses every id. A silently-empty result would make the comparison below pass for the
  // wrong reason, which is exactly the failure mode this test exists to prevent.
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

    // Sanity-check the extraction itself: if the bundle format changes and the regex silently
    // matches nothing, an empty list would make the comparison below pass for the wrong reason.
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
    // A file that is bundled but not web-accessible fails with no error: the <img> just renders
    // nothing. Reading the extension manifest rather than trusting a hardcoded list here.
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

    // Not an assertion on the exact number — that would need updating every time art is added.
    // The point is that the gap is stated out loud on every run.
    // eslint-disable-next-line no-console
    console.log(`Badge artwork coverage: ${withArtwork}/${total} (${total - withArtwork} awaiting artwork)`);

    expect(withArtwork).toBeGreaterThan(0);
    expect(withArtwork).toBeLessThanOrEqual(total);
  });
});
