import { Component, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-task-filter',
  templateUrl: './task-filter.html',
  styleUrl: './task-filter.css',
})
export class TaskFilter {
  statusChanged = output<string>();

  onChange(event: Event) {
    const select = event.target as HTMLSelectElement;

    this.statusChanged.emit(select.value)
  }
}
