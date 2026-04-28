import { Task } from '../types';
import { TaskInput } from './TaskInput';

interface Props {
  onCreate: (payload: Pick<Task, 'title' | 'note' | 'category' | 'priority' | 'timeBlock'>) => void;
  editingTask?: Task | null;
}

export function TodayOrders({ onCreate, editingTask }: Props) {
  return <TaskInput onCreate={onCreate} editingTask={editingTask} />;
}
