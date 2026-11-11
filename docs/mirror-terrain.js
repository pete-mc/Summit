// Mirrors Terrain's complete public front-end bundle (every lazy chunk, CSS, image, font) for reference.
// Usage: node docs/mirror-terrain.js [siteDir]   (default: docs/terrain.scouts.com.au)
// Downloads into <siteDir>.tmp and only replaces siteDir when the run is complete.
const fs = require("fs");
const https = require("https");
const path = require("path");

const ORIGIN = "https://terrain.scouts.com.au";
const SITE = path.resolve(process.argv[2] || path.join(__dirname, "terrain.scouts.com.au"));
const STAGING = SITE + ".tmp";
const MIN_JS_FILES = 150;

function get(url, attempt = 1) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 (Summit dev mirror)" } }, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${res.statusCode} ${url}`));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  }).catch((err) => (attempt < 3 && !/^4\d\d /.test(err.message) ? get(url, attempt + 1) : Promise.reject(err)));
}

const seen = new Set();
const failed = [];
const queue = [];

function enqueue(urlPath) {
  urlPath = urlPath.split(/[?#]/)[0];
  if (!urlPath.startsWith("/") || seen.has(urlPath)) return;
  seen.add(urlPath);
  queue.push(urlPath);
}

function scanForAssets(urlPath, text) {
  for (const m of text.matchAll(/\.p\s*\+\s*"([^"]+\.[a-z0-9]{2,5})"/g)) enqueue("/_nuxt/" + m[1]);
  for (const m of text.matchAll(/["'(]\/_nuxt\/([^"')\s]+)/g)) enqueue("/_nuxt/" + m[1]);
  if (urlPath.endsWith(".css")) {
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (m[1].startsWith("data:") || /^https?:/.test(m[1])) continue;
      enqueue(path.posix.resolve(path.posix.dirname(urlPath), m[1]));
    }
  }
}

// Gotcha: most chunks are lazy-loaded, so index.html doesn't name them. Their names and content hashes
// only exist as object literals inside the webpack runtime script.
function chunkUrlsFromRuntime(runtime) {
  const objectAfter = (marker) => {
    const start = runtime.indexOf("{", runtime.indexOf(marker));
    let depth = 0;
    for (let i = start; i < runtime.length; i++) {
      if (runtime[i] === "{") depth++;
      else if (runtime[i] === "}" && --depth === 0) return Function(`return (${runtime.slice(start, i + 1)})`)();
    }
    throw new Error(`Unterminated object after ${marker}`);
  };
  const jsStart = runtime.indexOf('.p+""+(');
  if (jsStart === -1) throw new Error("Runtime chunk-name map not found; webpack runtime format changed");
  const names = objectAfter('.p+""+(');
  const hashes = objectAfter('}[e]||e)+"."+');
  const cssHashes = objectAfter('.p+"css/"+');
  const urls = Object.keys(hashes).map((id) => `/_nuxt/${names[id] || id}.${hashes[id]}.js`);
  Object.values(cssHashes).forEach((h) => urls.push(`/_nuxt/css/${h}.css`));
  return urls;
}

function save(urlPath, body) {
  const dest = path.join(STAGING, urlPath === "/" ? "index.html" : urlPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, body);
}

async function worker() {
  while (queue.length) {
    const urlPath = queue.shift();
    try {
      const body = await get(ORIGIN + urlPath);
      save(urlPath, body);
      if (/\.(js|css|html|json)$/.test(urlPath) || urlPath === "/") scanForAssets(urlPath, body.toString());
    } catch (err) {
      failed.push(err.message);
    }
  }
}

async function main() {
  fs.rmSync(STAGING, { recursive: true, force: true });

  const html = (await get(ORIGIN + "/")).toString();
  save("/", html);
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) enqueue(m[1]);
  ["/sw.js", "/favicon.ico", "/robots.txt"].forEach(enqueue);

  const runtimeMatch = html.match(/src="(\/_nuxt\/[0-9a-f]{7}\.js)"/);
  if (!runtimeMatch) throw new Error("Runtime script not found in index.html");
  const runtimePath = runtimeMatch[1];
  const chunkUrls = chunkUrlsFromRuntime((await get(ORIGIN + runtimePath)).toString());
  chunkUrls.forEach(enqueue);
  console.log(`Runtime lists ${chunkUrls.length} lazy chunks/css`);

  while (queue.length) await Promise.all(Array.from({ length: 8 }, worker));

  const saved = Array.from(seen).filter((p) => fs.existsSync(path.join(STAGING, p === "/" ? "index.html" : p)));
  const jsCount = saved.filter((p) => p.endsWith(".js")).length;
  console.log(`Saved ${saved.length} files (${jsCount} JS); ${failed.length} failed`);
  failed.slice(0, 30).forEach((f) => console.log("  FAIL " + f));

  if (failed.length > 0 || jsCount < MIN_JS_FILES) {
    throw new Error(`Incomplete download, ${SITE} left unchanged. Partial copy is in ${STAGING}`);
  }

  fs.writeFileSync(
    path.join(STAGING, "MIRROR_INFO.txt"),
    `Source: ${ORIGIN}\nCaptured: ${new Date().toISOString()}\nRuntime: ${runtimePath}\nFiles saved: ${saved.length} (${jsCount} JS)\n`,
  );
  fs.rmSync(SITE, { recursive: true, force: true });
  fs.renameSync(STAGING, SITE);
  console.log(`Replaced ${SITE}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
