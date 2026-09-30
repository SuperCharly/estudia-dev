import type { Dataset, Exercise as ExerciseData } from '../../lib/content/schemas';
import CodeExercise from './CodeExercise';
import ManualExercise from './ManualExercise';
import QuizExercise from './QuizExercise';

interface Props {
  itemId: string;
  exercise: ExerciseData;
  dataset?: Dataset;
}

/** Punto de entrada de un ejercicio (una isla por ejercicio, hidratada al hacerse visible). */
export default function Exercise({ itemId, exercise, dataset }: Props) {
  switch (exercise.type) {
    case 'python':
    case 'sql':
      return <CodeExercise itemId={itemId} exercise={exercise} dataset={dataset} />;
    case 'quiz':
      return <QuizExercise itemId={itemId} exercise={exercise} />;
    case 'manual':
      return <ManualExercise itemId={itemId} exercise={exercise} />;
  }
}
