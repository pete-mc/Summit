#!/usr/bin/env node
/**
 * Mirrors Terrain's badge artwork into src/images/terrain/ under Terrain's own source paths.
 * Usage (from the repo root):
 *   npm run images:terrain              refresh src/images/terrain/ (badges only)
 *   npm run images:terrain -- --all DIR every image Terrain bundles, for browsing; nothing in src/ changes
 * See src/images/README.md.
 */
const fs = require("fs");
const https = require("https");
const path = require("path");
const vm = require("vm");

const TERRAIN = "https://terrain.scouts.com.au";
const BADGE_DIR = path.join(__dirname, "terrain");

const SIA_AREAS = ["adventure-sport", "art-literature", "creating-a-better-world", "environment", "growth-development", "stem-innovation"];

const BADGE_PATTERNS = [
  /^additional-award-badges\/[a-z0-9_]+\.svg$/,
  /^milestones\/(joey|cub|scout|venturer|rover)\/milestone-[123](-inactive)?\.svg$/,
  /^icon--oas-[a-z]+\.svg$/,
  /^icon-peak-award-(joey|cub|scout|venturer|rover)-(active|disabled)\.svg$/,
  new RegExp(`^template-assets/(${SIA_AREAS.join("|")})--default\\.svg$`),
];

/** Learning: a broken run must not wipe the folder, so refuse to replace it with fewer awards than this. */
const MIN_ADDITIONAL_AWARDS = 20;

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`${res.statusCode} ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

/**
 * Gotcha: the /_nuxt/img/ filenames carry a content hash that changes every Terrain deploy, and small images are
 * inlined as data: URIs with no URL at all. The stable handle is webpack's require.context map in the bundle,
 * `"./additional-award-badges/landcare.svg": 602`, so we run each chunk in a sandbox to collect its modules,
 * then call the image module to get its URL or data URI.
 */
async function loadTerrainImageModules() {
  const html = (await get(`${TERRAIN}/`)).toString();
  const scripts = (html.match(/\/_nuxt\/[^"]+\.js/g) || []).filter((src, index, all) => all.indexOf(src) === index);

  const modules = {};
  const webpackJsonp = {
    push: ([, chunkModules]) => {
      if (Array.isArray(chunkModules)) {
        chunkModules.forEach((fn, id) => fn && (modules[id] = fn));
      } else {
        Object.assign(modules, chunkModules);
      }
    },
  };

  let allSource = "";
  for (const src of scripts) {
    const source = (await get(TERRAIN + src)).toString();
    // Gotcha: the webpack runtime chunk replaces webpackJsonp.push with its own loader, so only run data chunks.
    if (!source.startsWith("(window.webpackJsonp")) continue;
    allSource += source + "\n";
    const window = { webpackJsonp };
    vm.runInNewContext(source, { window, self: window, webpackJsonp }, { timeout: 10000 });
  }

  const images = {};
  const contextEntry = /"\.\/([^"]+\.(?:svg|png|jpe?g))":(\d+)/g;
  let match;
  while ((match = contextEntry.exec(allSource))) {
    const relPath = match[1].replace(/^(icons|images)\//, "");
    const moduleFn = modules[match[2]];
    if (images[relPath] || !moduleFn) continue;

    const mod = { exports: {} };
    const require = Object.assign(() => ({}), { p: "/_nuxt/" });
    try {
      moduleFn(mod, mod.exports, require);
    } catch {
      continue;
    }
    const value = typeof mod.exports === "string" ? mod.exports : mod.exports.default;
    if (typeof value === "string") images[relPath] = value;
  }
  return images;
}

async function readImage(value) {
  if (!value.startsWith("data:")) return get(TERRAIN + value);
  const [header, data] = value.split(",");
  return header.includes(";base64") ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data));
}

async function writeImages(images, outDir) {
  const relPaths = Object.keys(images).sort();
  for (const relPath of relPaths) {
    const dest = path.join(outDir, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, await readImage(images[relPath]));
  }
  return relPaths;
}

async function main() {
  const allIndex = process.argv.indexOf("--all");
  const images = await loadTerrainImageModules();

  if (allIndex !== -1) {
    const outDir = path.resolve(process.argv[allIndex + 1] || "terrain-images");
    const written = await writeImages(images, outDir);
    console.log(`Saved ${written.length} images to ${outDir}`);
    return;
  }

  const badges = {};
  Object.keys(images)
    .filter((relPath) => BADGE_PATTERNS.some((pattern) => pattern.test(relPath)))
    .forEach((relPath) => (badges[relPath] = images[relPath]));

  const awardCount = Object.keys(badges).filter((relPath) => relPath.startsWith("additional-award-badges/")).length;
  if (awardCount < MIN_ADDITIONAL_AWARDS) {
    throw new Error(`Only ${awardCount} additional awards found; Terrain's bundle format may have changed. ${BADGE_DIR} left untouched.`);
  }

  const stagingDir = `${BADGE_DIR}.tmp`;
  fs.rmSync(stagingDir, { recursive: true, force: true });
  const written = await writeImages(badges, stagingDir);
  fs.rmSync(BADGE_DIR, { recursive: true, force: true });
  fs.renameSync(stagingDir, BADGE_DIR);

  console.log(`Saved ${written.length} badge images to ${BADGE_DIR}`);
  console.log("Next: git diff --stat src/images/terrain, then npm test (badgeManifest.spec.ts) and check the pages in Edge.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
