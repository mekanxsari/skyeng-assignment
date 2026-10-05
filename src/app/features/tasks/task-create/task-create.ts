import { Component, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-task-create',
  templateUrl: './task-create.html',
  styleUrl: './task-create.css',
})
export class TaskCreate {
  clicked = output<void>();
}