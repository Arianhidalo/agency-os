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

export const buildEnemyIntelligence = (tasks: Task[]) => {
  const weekTasks = tasks.filter((t) => inLastDays(t.createdAt, 7));
  const weekCompleted = weekTasks.filter((t) => t.status === 'completed').length;
  const weekFailed = weekTasks.filter((t) => t.status === 'failed').length;
  const failed = weekTasks.filter((t) => t.status === 'failed');

  const topSabotage = dominant(failed.map((t) => t.sabotageCategory).filter(Boolean) as SabotageCategory[]);
  const topTimeBlock = dominant(failed.map((t) => t.timeBlock) as TimeBlock[]);
  const topPriorityFailed = dominant(failed.map((t) => t.priority) as Priority[]);

  const insights: string[] = [];
  if (topSabotage && topTimeBlock) insights.push(`${topSabotage} appears most often at ${topTimeBlock.toLowerCase()}.`);
  if (topSabotage && topPriorityFailed) insights.push(`${topPriorityFailed} tasks are being delayed by ${topSabotage}.`);
  if (weekFailed > 0) insights.push('Your failures are not random. The pattern is visible.');

  return { weekCompleted, weekFailed, topSabotage, topTimeBlock, topPriorityFailed, insights };
};
