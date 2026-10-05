import { Component, inject, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  switchMap
} from 'rxjs';

import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus } from '../../../core/models/task.model';

@Component({
  imports: [],
  selector: 'app-task-list',
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList {
  private taskService = inject(TaskService);

  status = input.required<string>();
  search = input.required<string>();
  refresh = input(0);

  tasks = signal<Task[]>([]);

  updatingTaskIds = signal<number[]>([]);

  isLoading = signal(true);
  loadError = signal('');

  toastMessage = signal('');

  private toastTimer?: ReturnType<typeof setTimeout>;
  private status$ = toObservable(this.status);
  private search$ = toObservable(this.search).pipe(
    debounceTime(400),
    distinctUntilChanged()
  );

  private refresh$ = toObservable(this.refresh);
  private retryRequest = signal(0);
  private retry$ = toObservable(this.retryRequest);

  constructor() {
    combineLatest([
      this.status$,
      this.search$,
      this.refresh$,
      this.retry$
    ])
      .pipe(
        switchMap(([status, search]) => {
          this.isLoading.set(true);
          this.loadError.set('');

          return this.taskService.getTasks(status, search).pipe(
            catchError((error) => {
              console.error(error);

              this.isLoading.set(false);
              this.loadError.set(
                'Failed to load tasks. Please try again.'
              );

              return EMPTY;
            })
          );
        })
      )
      .subscribe({
        next: (tasks) => {
          this.tasks.set(tasks);
          this.isLoading.set(false);
          this.loadError.set('');
        }
      });
  }

  onStatusChange(task: Task, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as TaskStatus;

    this.updateStatus(task, newStatus);
  }

  updateStatus(task: Task, newStatus: TaskStatus) {
    if (this.updatingTaskIds().includes(task.id)) {
      return;
    }

    const oldStatus = task.status;

    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === task.id
          ? { ...t, status: newStatus }
          : t
      )
    );

    this.updatingTaskIds.update(ids => [
      ...ids,
      task.id
    ]);

    this.taskService
      .updateTaskStatus(task.id, newStatus)
      .subscribe({
        next: (updatedTask) => {
          if (
            this.status() !== 'all' &&
            updatedTask.status !== this.status()
          ) {
            this.tasks.update(tasks =>
              tasks.filter(t => t.id !== updatedTask.id)
            );
          } else {
            this.tasks.update(tasks =>
              tasks.map(t =>
                t.id === updatedTask.id
                  ? updatedTask
                  : t
              )
            );
          }

          this.updatingTaskIds.update(ids =>
            ids.filter(id => id !== task.id)
          );
        },

        error: (error) => {
          console.error(error);

          this.tasks.update(tasks =>
            tasks.map(t =>
              t.id === task.id
                ? { ...t, status: oldStatus }
                : t
            )
          );

          this.updatingTaskIds.update(ids =>
            ids.filter(id => id !== task.id)
          );

          this.showToast(
            'Failed to update task status. Please try again.'
          );
        }
      });
  }

  retry() {
    this.retryRequest.update(value => value + 1);
  }

  showToast(message: string) {
    this.toastMessage.set(message);

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('ru-RU', {
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
}