"""Arnés que ejecuta el código del estudiante y las pruebas de un ejercicio en Pyodide.

Se ejecuta en un Web Worker del navegador del propio estudiante: nunca en un servidor.
Cada ejecución usa un espacio de nombres nuevo para que no se filtre estado entre intentos.
"""

import io
import sys
import traceback

USER_FILENAME = "<tu código>"
TESTS_FILENAME = "<pruebas>"


def _format_user_error(error):
    """Describe el error en una línea, indicando la línea del código del estudiante."""
    message = "".join(traceback.format_exception_only(type(error), error)).strip()
    if isinstance(error, SyntaxError):
        return message.splitlines()[-1] + f" (línea {error.lineno})"
    line = None
    tb = error.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == USER_FILENAME:
            line = tb.tb_lineno
        tb = tb.tb_next
    return f"{message} (línea {line})" if line else message


def _make_input(output, lines):
    """Crea un `input()` simulado que lee de `lines` y muestra lo "tecleado" en `output`."""
    pending = list(lines)

    def fake_input(prompt=""):
        output.write(str(prompt))
        if not pending:
            raise EOFError("El ejercicio no proporciona más datos para input().")
        value = pending.pop(0)
        output.write(value + "\n")
        return value

    return fake_input


def _last_line(text):
    """Última línea no vacía de un texto impreso ("" si no hay ninguna)."""
    lines = [line for line in text.splitlines() if line.strip()]
    return lines[-1] if lines else ""


def run_exercise(user_code, test_code, stdin_lines, mode):
    """Ejecuta `user_code` y, si `mode == "grade"`, las pruebas.

    Devuelve un dict con:
      status: "ok" (ejecutado), "error" (falló el código), "pass" o "fail" (pruebas)
      stdout: texto impreso por el código del estudiante
      message: explicación para el estudiante
    """
    output = io.StringIO()
    fake_input = _make_input(output, stdin_lines)

    def ejecutar_con(entradas):
        """Vuelve a ejecutar el código del estudiante con otras entradas y devuelve lo que imprimió.

        Permite probar un programa con varios casos (no solo con el `stdin` del ejercicio).
        """
        buffer = io.StringIO()
        previous = sys.stdout
        sys.stdout = buffer
        try:
            namespace = {"__name__": "__main__", "input": _make_input(buffer, entradas)}
            exec(compile(user_code, USER_FILENAME, "exec"), namespace)
        finally:
            sys.stdout = previous
        return buffer.getvalue()

    def capturar_salida(func, *args, **kwargs):
        """Ejecuta `func` y devuelve el texto que imprimió (para usar en las pruebas)."""
        buffer = io.StringIO()
        previous = sys.stdout
        sys.stdout = buffer
        try:
            func(*args, **kwargs)
        finally:
            sys.stdout = previous
        return buffer.getvalue()

    namespace = {"__name__": "__main__", "input": fake_input}
    previous_stdout = sys.stdout
    sys.stdout = output
    try:
        try:
            exec(compile(user_code, USER_FILENAME, "exec"), namespace)
        except Exception as error:  # noqa: BLE001 — cualquier error del estudiante se reporta
            return {"status": "error", "stdout": output.getvalue(), "message": _format_user_error(error)}

        stdout = output.getvalue()
        if mode != "grade":
            return {"status": "ok", "stdout": stdout, "message": ""}

        namespace["salida"] = stdout
        namespace["codigo"] = user_code
        namespace["capturar_salida"] = capturar_salida
        namespace["ejecutar_con"] = ejecutar_con
        namespace["ultima_linea"] = _last_line
        try:
            exec(compile(test_code, TESTS_FILENAME, "exec"), namespace)
        except AssertionError as error:
            message = str(error) or "Una de las pruebas no se cumplió."
            return {"status": "fail", "stdout": stdout, "message": message}
        except Exception as error:  # noqa: BLE001
            message = "Tu código no se pudo comprobar: " + _format_user_error(error)
            return {"status": "fail", "stdout": stdout, "message": message}
        return {"status": "pass", "stdout": stdout, "message": "¡Todas las pruebas pasaron!"}
    finally:
        sys.stdout = previous_stdout
