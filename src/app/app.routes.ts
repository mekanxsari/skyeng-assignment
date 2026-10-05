import { Routes } from '@angular/router';
import { App } from './app';
import { TasksPage } from './features/tasks/tasks-page/tasks-page';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full'
    },
    {
        path: 'tasks',
        component: TasksPage
    }
];
