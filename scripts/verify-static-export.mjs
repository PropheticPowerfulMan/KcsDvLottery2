import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const htmlPath = join("out", "index.html");

if (!existsSync(htmlPath)) {
  fail("Missing out/index.html. Run npm run build first.");
}

const html = readFileSync(htmlPath, "utf8");
const stylesheetMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/);

if (!stylesheetMatch) {
  fail("No stylesheet link found in out/index.html.");
}

const stylesheetHref = stylesheetMatch[1];

if (!stylesheetHref.startsWith("./_next/static/css/")) {
  fail(`Stylesheet must be relative. Found: ${stylesheetHref}`);
}

const stylesheetPath = join("out", stylesheetHref.replace(/^\.\//, ""));

if (!existsSync(stylesheetPath)) {
  fail(`Stylesheet file does not exist: ${stylesheetPath}`);
}

if (/href="\//.test(html) || /src="\//.test(html)) {
  fail("Static export contains root-relative href/src paths. Use relative paths for local delivery.");
}

console.log(`Static export verified: ${stylesheetHref}`);

function fail(message) {
  console.error(message);
  process.exit(1);
}
