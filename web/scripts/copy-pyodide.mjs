// Copia los archivos de Pyodide a public/pyodide/ para servirlos desde el propio sitio
// (sin CDN externo: la CSP puede quedarse en 'self' y no dependemos de terceros).
// Se ejecuta automáticamente antes de `dev` y `build`.
import { copyFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'pyodide');
const target = join(root, 'public', 'pyodide');

const RUNTIME_FILES = /\.(mjs|js|wasm|zip)$|^pyodide-lock\.json$/;
const EXCLUDED = /\.map$|\.d\.ts$|^package\.json$/;

mkdirSync(target, { recursive: true });
const files = readdirSync(source).filter((name) => RUNTIME_FILES.test(name) && !EXCLUDED.test(name));
for (const name of files) copyFileSync(join(source, name), join(target, name));

const { version } = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
console.log(`Pyodide ${version}: ${files.length} archivos copiados a public/pyodide/`);
