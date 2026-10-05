import { Component, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-task-search',
  templateUrl: './task-search.html',
  styleUrl: './task-search.css',
})
export class TaskSearch {
  searchChanged = output<string>();

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;

    this.searchChanged.emit(input.value);
  }
}