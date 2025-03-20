import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task/task.service';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
    selector: 'task-list',
    standalone: true,
    imports: [CommonModule, TaskItemComponent, ReactiveFormsModule],
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  tasks: Task[] = [];
  filter = new FormControl('all');
  searchControl = new FormControl('');
  sort = new FormControl('default');
  filteredTasks$: Observable<Task[]>;

  private taskService = inject(TaskService);

  constructor() {
      this.filteredTasks$ = combineLatest([
          this.taskService.getTasks(),
          this.filter.valueChanges.pipe(startWith('all')),
          this.searchControl.valueChanges.pipe(startWith('')),
          this.sort.valueChanges.pipe(startWith('default'))
      ]).pipe(
          map(([tasks, filter, searchTerm, sort]) => {
              let filteredTasks = [...tasks];

              if (filter === 'active') {
                  filteredTasks = filteredTasks.filter(task => !task.completed);
              } else if (filter === 'completed') {
                  filteredTasks = filteredTasks.filter(task => task.completed);
              }

              if (searchTerm) {
                  const term = searchTerm.toLowerCase().trim();
                  filteredTasks = filteredTasks.filter(task =>
                      task.title.toLowerCase().includes(term) ||
                      (task.description && task.description.toLowerCase().includes(term))
                  );
              }

              // Définition de priorityOrder ici, dans le scope de la fonction map
              const priorityOrder = { 'high': 1, 'medium': 2, 'low': 3 };

              if (sort === 'dueDate') {
                  filteredTasks.sort((a, b) => {
                      if (!a.dueDate) return 1;
                      if (!b.dueDate) return -1;
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  });
              } else if (sort === 'priority') {
                  filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
              } else {
                  filteredTasks.sort((a, b) => {
                      if (!a.dueDate && !b.dueDate) {
                          return priorityOrder[a.priority] - priorityOrder[b.priority];
                      }
                      if (!a.dueDate) return 1;
                      if (!b.dueDate) return -1;

                      const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                      if (dateComparison !== 0) {
                          return dateComparison;
                      } else {
                          return priorityOrder[a.priority] - priorityOrder[b.priority];
                      }
                  });
              }

              return filteredTasks;
          })
      );
  }

    private loadTasks(): void {
        this.taskService.getTasks().subscribe(tasks => {
            this.tasks = tasks;
        });
    }

    setFilter(filterValue: 'all' | 'active' | 'completed'): void {
        this.filter.setValue(filterValue);
    }

    setSort(sortValue: 'dueDate' | 'priority' | 'default'): void {
        this.sort.setValue(sortValue);
    }

    onToggleTask(taskId: string): void {
        this.taskService.toggleTaskCompletion(taskId).subscribe(() => {
            // Mise à jour automatique via l'observable
        });
    }

    onDeleteTask(taskId: string): void {
        this.taskService.deleteTask(taskId).subscribe(() => {
            // Mise à jour automatique via l'observable
        });
    }

    onUpdateTask(updatedTask: Task): void {
        this.taskService.updateTask(updatedTask).subscribe(() => {
            // Mise à jour automatique via l'observable
        });
    }

    clearSearch(): void {
        this.searchControl.setValue('');
    }
}