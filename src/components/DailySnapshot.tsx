import { DailyStats } from './DailyStats';

interface Props {
  completed: number;
  pending: number;
  failed: number;
  streak: number;
  progress: number;
  doctrine: string;
  showDoctrine: boolean;
}

export function DailySnapshot({ completed, pending, failed, streak, progress, doctrine, showDoctrine }: Props) {
  return (
    <DailyStats
      completed={completed}
      pending={pending}
      failed={failed}
      streak={streak}
      progress={progress}
      phrase={showDoctrine ? doctrine : failed > 0 ? 'Damage contained. Resume the mission.' : 'Execute the next correct action.'}
    />
  );
}
