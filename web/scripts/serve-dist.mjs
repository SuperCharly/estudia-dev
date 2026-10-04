// Sirve `dist/` aplicando `dist/_headers` como lo hace Cloudflare Pages.
//
// `astro preview` ignora `_headers`, así que con él las pruebas E2E no ejercitaban las
// cabeceras de seguridad reales. Este servidor es solo para pruebas locales y de CI.
//
// Reglas de `_headers` que se implementan (las que usa el proyecto):
//   - una ruta por bloque, con `*` como comodín;
//   - se aplican todos los bloques que coinciden con la ruta;
//   - si una cabecera aparece en varios, sus valores se unen con ", ".
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] ?? 4321);

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.data': 'application/octet-stream',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml; charset=utf-8',
  '.zip': 'application/zip',
};

/** Convierte `_headers` en una lista de `{ matches(path), headers: [nombre, valor][] }`. */
function parseHeaders(text) {
  const rules = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      const pattern = line
        .trim()
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      rules.push({ matches: (path) => regex.test(path), headers: [] });
    } else {
      const separator = line.indexOf(':');
      rules.at(-1)?.headers.push([line.slice(0, separator).trim(), line.slice(separator + 1).trim()]);
    }
  }
  return rules;
}

const headersFile = join(root, '_headers');
const rules = existsSync(headersFile) ? parseHeaders(readFileSync(headersFile, 'utf8')) : [];

function headersFor(path) {
  const combined = new Map();
  for (const rule of rules) {
    if (!rule.matches(path)) continue;
    for (const [name, value] of rule.headers) {
      const key = name.toLowerCase();
      combined.set(key, combined.has(key) ? `${combined.get(key)}, ${value}` : value);
    }
  }
  return combined;
}

/** Archivo que corresponde a la ruta, o `null` si no existe o sale de `dist/`. */
function resolveFile(path) {
  const candidate = normalize(join(root, decodeURIComponent(path)));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const index = join(candidate, 'index.html');
  return existsSync(index) ? index : null;
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  let file;
  try {
    file = resolveFile(pathname);
  } catch {
    file = null;
  }
  const status = file ? 200 : 404;
  file ??= join(root, '404.html');

  for (const [name, value] of headersFor(pathname)) response.setHeader(name, value);
  response.setHeader('content-type', MIME[extname(file)] ?? 'application/octet-stream');
  response.statusCode = status;
  createReadStream(file)
    .on('error', () => response.end())
    .pipe(response);
}).listen(port, () => {
  console.log(`Sirviendo dist/ con _headers en http://localhost:${port}`);
});
