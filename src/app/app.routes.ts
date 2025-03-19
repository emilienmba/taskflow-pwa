// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { TaskListComponent } from './features/tasks/components/task-list/task-list.component';

export const routes: Routes = [
    { path: '', redirectTo: '/tasks', pathMatch: 'full' },
    { path: 'tasks', component: TaskListComponent }, // Utilisation du composant de page de tâches
    { path: '**', redirectTo: '/tasks' }
];