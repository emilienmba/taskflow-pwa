// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { 
    path: 'tasks', 
    loadComponent: () => import('./app.component').then(m => m.AppComponent) 
  },
  { 
    path: '**', 
    redirectTo: '/tasks' 
  }
];