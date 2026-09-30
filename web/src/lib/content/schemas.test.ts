import { describe, expect, it } from 'vitest';
import { canAdapt, exerciseSchema, toClientExercise } from './schemas';

describe('canAdapt', () => {
  it.each([
    ['CC-BY', true],
    ['CC-BY-NC-SA', true],
    ['CC-BY-ND', false],
    ['gratuita-sin-licencia-abierta', false],
    ['sin-verificar', false],
  ] as const)('%s → %s', (license, expected) => {
    expect(canAdapt(license)).toBe(expected);
  });
});

describe('toClientExercise', () => {
  it('no envía al navegador los errores típicos', () => {
    const exercise = exerciseSchema.parse({
      id: 'x',
      type: 'python',
      title: 'X',
      difficulty: 1,
      prompt: 'p',
      solution: 'print(1)',
      tests: 'pass',
      mistakes: ['print(2)'],
    });
    expect(toClientExercise(exercise)).toMatchObject({ mistakes: [], solution: 'print(1)' });
  });

  it('deja intactos los ejercicios sin campos internos', () => {
    const quiz = exerciseSchema.parse({
      id: 'q',
      type: 'quiz',
      title: 'Q',
      difficulty: 1,
      prompt: 'p',
      options: ['a', 'b'],
      answer: 0,
      explanation: 'e',
    });
    expect(toClientExercise(quiz)).toBe(quiz);
  });
});

describe('quizExerciseSchema', () => {
  it('rechaza una respuesta fuera de rango', () => {
    const result = exerciseSchema.safeParse({
      id: 'q',
      type: 'quiz',
      title: 'Q',
      difficulty: 1,
      prompt: 'p',
      options: ['a', 'b'],
      answer: 2,
      explanation: 'e',
    });
    expect(result.success).toBe(false);
  });
});
