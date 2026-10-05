export type TaskStatus = 'new' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
}
