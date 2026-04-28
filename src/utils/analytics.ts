import { Priority, SabotageCategory, Task, TimeBlock } from '../types';

const inLastDays = (isoDate: string, days: number) => {
  const time = new Date(isoDate).getTime();
  return Date.now() - time <= days * 24 * 60 * 60 * 1000;
};

const dominant = <T extends string>(values: T[]): T | null => {
  if (!values.length) return null;
  const map = values.reduce<Record<string, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0][0] as T;
};

const recommendationByEnemy: Record<string, string> = {
  'The Negotiator': 'Reduce initial friction: start with 5 minutes before evaluating.',
  'The Seducer': 'Remove dopamine triggers 30 minutes before critical blocks.',
  'The Arsonist': 'Apply Wheel Protocol immediately after any slip.',
};

export const buildEnemyIntelligence = (tasks: Task[]) => {
  const weekTasks = tasks.filter((t) => inLastDays(t.createdAt, 7));
  const weekCompleted = weekTasks.filter((t) => t.status === 'completed').length;
  const weekFailed = weekTasks.filter((t) => t.status === 'failed').length;
  const failed = weekTasks.filter((t) => t.status === 'failed');

  const topSabotage = dominant(failed.map((t) => t.sabotageCategory).filter(Boolean) as SabotageCategory[]);
  const topTimeBlock = dominant(failed.map((t) => t.timeBlock) as TimeBlock[]);
  const topPriorityFailed = dominant(failed.map((t) => t.priority) as Priority[]);
  const topCategoryFailed = dominant(failed.map((t) => t.category));
  const executionRate = weekTasks.length ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

  const insights: string[] = [];
  if (topSabotage && topTimeBlock) insights.push(`Pattern detected: ${topSabotage} appears most often at ${topTimeBlock.toLowerCase()}.`);
  if (topSabotage && topPriorityFailed) insights.push(`Pattern detected: ${topSabotage} appears in ${topPriorityFailed.toLowerCase()} priority tasks.`);
  if (weekFailed > 0) insights.push('Your failures are not random. The pattern is visible.');

  return {
    weekCompleted,
    weekFailed,
    topSabotage,
    topTimeBlock,
    topPriorityFailed,
    topCategoryFailed,
    executionRate,
    strategicRecommendation: recommendationByEnemy[topSabotage ?? ''] ?? 'Hold the line: execute the next correct action immediately.',
    insights,
  };
};
