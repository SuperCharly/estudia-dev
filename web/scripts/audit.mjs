// Auditoría de dependencias con excepciones documentadas.
//
// Ejecuta `npm audit` sobre las dependencias de producción y falla si hay algún aviso de
// severidad alta o crítica que no esté en `audit-exceptions.json`. Cada excepción lleva su
// motivo y una fecha de revisión: pasada esa fecha, o si el aviso ya no aparece, el script
// también falla, para que ninguna excepción se quede olvidada.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOCKING = new Set(['high', 'critical']);

const exceptions = JSON.parse(readFileSync(join(root, 'audit-exceptions.json'), 'utf8'));

// `npm audit` termina con código distinto de cero cuando encuentra avisos: se lee su JSON.
const audit = spawnSync('npm audit --omit=dev --json', { cwd: root, encoding: 'utf8', shell: true });
let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error('No se pudo leer el resultado de `npm audit`:\n', audit.stdout, audit.stderr);
  process.exit(2);
}
if (!report.vulnerabilities) {
  console.error('`npm audit` no devolvió un informe válido:\n', audit.stdout);
  process.exit(2);
}

// Los avisos reales son las entradas de `via` que son objetos; las que son texto solo indican
// que un paquete depende de otro afectado.
const advisories = new Map();
for (const vulnerability of Object.values(report.vulnerabilities)) {
  for (const via of vulnerability.via) {
    if (typeof via === 'object' && BLOCKING.has(via.severity)) {
      const id = via.url?.split('/').pop() ?? String(via.source);
      advisories.set(id, via);
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
const problems = [];

for (const exception of exceptions) {
  if (!advisories.has(exception.advisory)) {
    problems.push(
      `La excepción ${exception.advisory} (${exception.package}) ya no hace falta: quítala de audit-exceptions.json.`,
    );
  } else if (today > exception.reviewBy) {
    problems.push(
      `La excepción ${exception.advisory} (${exception.package}) debía revisarse antes del ${exception.reviewBy}. ` +
        'Comprueba si ya hay versión corregida; si no, confirma que el motivo sigue vigente y actualiza la fecha.',
    );
  } else {
    console.log(`Excepción vigente hasta ${exception.reviewBy}: ${exception.advisory} (${exception.package}).`);
  }
}

const allowed = new Set(exceptions.map((exception) => exception.advisory));
for (const [id, advisory] of advisories) {
  if (!allowed.has(id)) {
    problems.push(`[${advisory.severity}] ${advisory.name}: ${advisory.title} — ${advisory.url}`);
  }
}

if (problems.length > 0) {
  console.error(`La auditoría de dependencias encontró ${problems.length} problema(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log('Auditoría de dependencias correcta: sin avisos altos o críticos fuera de las excepciones.');
