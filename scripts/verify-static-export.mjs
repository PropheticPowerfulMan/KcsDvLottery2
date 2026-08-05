import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const htmlPath = join("out", "index.html");

if (!existsSync(htmlPath)) {
  fail("Le fichier out/index.html est introuvable. Lancez d'abord npm run build.");
}

const html = readFileSync(htmlPath, "utf8");
const stylesheetMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/);

if (!stylesheetMatch) {
  fail("Aucun lien CSS n'a été trouvé dans out/index.html.");
}

const stylesheetHref = stylesheetMatch[1];

if (!stylesheetHref.startsWith("./_next/static/css/")) {
  fail(`Le lien CSS doit être relatif. Valeur trouvée : ${stylesheetHref}`);
}

const stylesheetPath = join("out", stylesheetHref.replace(/^\.\//, ""));

if (!existsSync(stylesheetPath)) {
  fail(`Le fichier CSS n'existe pas : ${stylesheetPath}`);
}

if (/href="\//.test(html) || /src="\//.test(html)) {
  fail("L'export statique contient des chemins href/src absolus. Utilisez des chemins relatifs pour la livraison locale.");
}

console.log(`Export statique vérifié : ${stylesheetHref}`);

function fail(message) {
  console.error(message);
  process.exit(1);
}
