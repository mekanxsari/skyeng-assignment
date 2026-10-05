import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-task-modal',
  templateUrl: './task-modal.html',
  styleUrl: './task-modal.css',
})
export class TaskModal {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  isOpen = input(false);

  closed = output<void>();
  taskCreated = output<Task>();

  isSubmitting = signal(false);
  toastMessage = signal('');

  private toastTimer?: ReturnType<typeof setTimeout>;

  taskForm = this.fb.nonNullable.group({
    title: ['', [
      Validators.required,
      Validators.maxLength(100),
      this.noWhitespaceValidator
    ]],

    description: ['']
  });

  noWhitespaceValidator(control: { value: string }) {
    if (!control.value.trim()) {
      return {
        whitespace: true
      };
    }

    return null;
  }

  onBlur(field: 'title' | 'description') {
    this.taskForm.controls[field].markAsTouched();
  }

  onSubmit() {
    if (this.isSubmitting()) {
      return;
    }

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const title =
      this.taskForm.controls.title.value.trim();

    const description =
      this.taskForm.controls.description.value.trim();

    this.isSubmitting.set(true);

    this.taskService
      .createTask(title, description)
      .subscribe({

        next: (task) => {

          this.taskForm.reset({
            title: '',
            description: ''
          });

          this.isSubmitting.set(false);

          this.taskCreated.emit(task);
        },

        error: (error) => {

          console.error(error);

          this.isSubmitting.set(false);

          this.showToast(
            'Failed to create task'
          );
        }

      });
  }

  close() {
    if (this.isSubmitting()) {
      return;
    }

    this.closed.emit();
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
}