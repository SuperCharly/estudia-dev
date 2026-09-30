import { loadPyodide } from 'pyodide';
import { beforeAll, describe, expect, it } from 'vitest';
import type { PythonRequest, RunResult } from '../types';
import { createPythonRunner } from './grader';

let run: (request: PythonRequest) => RunResult;

beforeAll(async () => {
  run = createPythonRunner(await loadPyodide());
});

const request = (overrides: Partial<PythonRequest>): PythonRequest => ({
  language: 'python',
  mode: 'grade',
  code: '',
  tests: 'pass',
  stdin: [],
  ...overrides,
});

describe('createPythonRunner', () => {
  it('ejecuta código y captura la salida', () => {
    const result = run(request({ mode: 'run', code: 'print("hola")\nprint(1 + 2)' }));
    expect(result).toEqual({ status: 'ok', message: '', stdout: 'hola\n3\n' });
  });

  it('aprueba cuando las pruebas pasan, con acceso a `salida`', () => {
    const result = run(request({ code: 'print("Hola, mundo")', tests: 'assert salida == "Hola, mundo\\n"' }));
    expect(result.status).toBe('pass');
  });

  it('reprueba con el mensaje del assert', () => {
    const result = run(request({ code: 'x = 1', tests: 'assert x == 2, "x debería valer 2"' }));
    expect(result).toMatchObject({ status: 'fail', message: 'x debería valer 2' });
  });

  it('reporta errores del estudiante con su número de línea', () => {
    const result = run(request({ code: 'a = 1\nprint(b)' }));
    expect(result.status).toBe('error');
    expect(result.message).toContain('NameError');
    expect(result.message).toContain('línea 2');
  });

  it('reporta errores de sintaxis', () => {
    const result = run(request({ code: 'print("hola"' }));
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/SyntaxError.*línea 1/);
  });

  it('entrega los datos de stdin a input() y los muestra en la salida', () => {
    const result = run(
      request({
        mode: 'run',
        code: 'nombre = input("¿Nombre? ")\nprint(f"Hola, {nombre}")',
        stdin: ['Ana'],
      }),
    );
    expect(result.stdout).toBe('¿Nombre? Ana\nHola, Ana\n');
  });

  it('avisa si input() se queda sin datos', () => {
    const result = run(request({ code: 'input()' }));
    expect(result).toMatchObject({ status: 'error' });
    expect(result.message).toContain('EOFError');
  });

  it('ofrece capturar_salida para probar funciones que imprimen', () => {
    const result = run(
      request({
        code: 'def saluda(n):\n    print("Hola", n)',
        tests: 'assert capturar_salida(saluda, "Ana") == "Hola Ana\\n"',
      }),
    );
    expect(result.status).toBe('pass');
  });

  it('reprueba (sin romperse) si falta una función que usan las pruebas', () => {
    const result = run(request({ code: 'x = 1', tests: 'assert suma(1, 2) == 3' }));
    expect(result.status).toBe('fail');
    expect(result.message).toContain('NameError');
  });

  it('ejecutar_con prueba el programa con otras entradas', () => {
    const code = 'n = int(input())\nprint("par" if n % 2 == 0 else "impar")';
    // Como en una terminal, lo "tecleado" en input() aparece en la salida.
    const tests = [
      'assert ejecutar_con(["4"]) == "4\\npar\\n"',
      'assert ultima_linea(ejecutar_con(["7"])) == "impar"',
      'assert salida == "3\\nimpar\\n"',
    ].join('\n');
    expect(run(request({ code, tests, stdin: ['3'] })).status).toBe('pass');
  });

  it('ejecutar_con detecta respuestas escritas "a mano"', () => {
    const tests = 'assert ultima_linea(ejecutar_con(["4"])) == "par", "Falla con 4"';
    const result = run(request({ code: 'input()\nprint("impar")', tests, stdin: ['3'] }));
    expect(result).toMatchObject({ status: 'fail', message: 'Falla con 4' });
  });

  it('ejecutar_con no altera la salida original ni el espacio de nombres', () => {
    const tests = ['ejecutar_con(["9"])', 'assert salida == "1\\n1\\n"', 'assert x == 1'].join('\n');
    const result = run(request({ code: 'x = int(input())\nprint(x)', tests, stdin: ['1'] }));
    expect(result.status).toBe('pass');
  });

  it('ultima_linea ignora líneas vacías', () => {
    const result = run(
      request({ code: 'print("a")\nprint("b")\nprint()', tests: 'assert ultima_linea(salida) == "b"' }),
    );
    expect(result.status).toBe('pass');
  });

  it('aísla cada ejecución: no se filtran variables entre intentos', () => {
    run(request({ mode: 'run', code: 'secreto = 123' }));
    const result = run(request({ code: '', tests: 'assert "secreto" not in globals()' }));
    expect(result.status).toBe('pass');
  });

  it('restaura sys.stdout aunque el código falle', () => {
    run(request({ code: 'raise ValueError("x")' }));
    const result = run(request({ mode: 'run', code: 'print("sigo aquí")' }));
    expect(result.stdout).toBe('sigo aquí\n');
  });
});
