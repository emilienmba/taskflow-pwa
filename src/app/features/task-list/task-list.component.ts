import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Task } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent], // Import standalone components
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = []; // List of tasks

  constructor(private taskService: TaskService) {}

  /**
   * Fetches tasks on component initialization.
   */
  ngOnInit(): void {
    this.taskService.getTasks().subscribe((tasks) => (this.tasks = tasks));
  }

  /**
   * Deletes a task by its ID.
   * @param taskId - The ID of the task to delete.
   */
  deleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId);
  }
}