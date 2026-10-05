import { Component, signal } from '@angular/core';

import { Task } from '../../../core/models/task.model';

import { TaskList } from '../task-list/task-list';
import { TaskSearch } from '../task-search/task-search';
import { TaskFilter } from '../task-filter/task-filter';
import { TaskCreate } from '../task-create/task-create';
import { TaskModal } from '../task-modal/task-modal';

@Component({
  imports: [
    TaskList,
    TaskSearch,
    TaskFilter,
    TaskCreate,
    TaskModal
  ],
  selector: 'app-tasks-page',
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.css',
})
export class TasksPage {
  selectedStatus = signal('all');
  searchTerm = signal('');
  isModalOpen = signal(false);

  refreshList = signal(0);
  creationMessage = signal('');

  private creationToastTimer?: ReturnType<typeof setTimeout>;

  onStatusChanged(status: string) {
    this.selectedStatus.set(status);
  }

  onSearchChanged(search: string) {
    this.searchTerm.set(search);
  }

  openModal() {
    if (this.creationToastTimer) {
      clearTimeout(this.creationToastTimer);
    }
    this.creationMessage.set('');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onTaskCreated(task: Task) {
    this.isModalOpen.set(false);

    this.refreshList.update(value => value + 1);

    this.creationMessage.set(
      'Task created successfully.'
    );

    if (this.creationToastTimer) {
      clearTimeout(this.creationToastTimer);
    }

    this.creationToastTimer = setTimeout(() => {
      this.creationMessage.set('');
    }, 4000);
  }
}