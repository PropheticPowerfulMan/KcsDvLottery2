import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

if (!existsSync(root)) {
  console.error("Le dossier out/ est introuvable. Lancez d'abord npm run build.");
  process.exit(1);
}

const server = createServer((request, response) => {
  const requestedPath = new URL(request.url ?? "/", `http://localhost:${port}`).pathname;
  const cleanPath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  let filePath = resolve(join(root, cleanPath === "/" ? "index.html" : cleanPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Accès interdit");
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath)) {
    filePath = join(root, "404.html");
  }

  response.setHeader("Content-Type", mimeTypes[extname(filePath)] ?? "application/octet-stream");
  createReadStream(filePath).pipe(response);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`Le site local semble déjà lancé : http://localhost:${port}`);
    process.exit(0);
  }

  console.error(error);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Aperçu local KCS : http://localhost:${port}`);
});
