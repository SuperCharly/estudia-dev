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
