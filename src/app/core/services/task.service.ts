import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root', // Provided at the root level for singleton usage
})
export class TaskService {
  private tasks: Task[] = []; // Local storage for tasks
  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks); // Observable for tasks

  constructor() {}

  /**
   * Returns an observable of the tasks.
   */
  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  /**
   * Adds a new task to the list.
   * @param task - The task to add.
   */
  addTask(task: Task): void {
    task.id = this.tasks.length + 1; // Generate a unique ID
    this.tasks.push(task);
    this.tasksSubject.next(this.tasks); // Emit the updated list
  }

  /**
   * Updates an existing task.
   * @param updatedTask - The task with updated properties.
   */
  updateTask(updatedTask: Task): void {
    const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
      this.tasksSubject.next(this.tasks); // Emit the updated list
    }
  }

  /**
   * Deletes a task by its ID.
   * @param taskId - The ID of the task to delete.
   */
  deleteTask(taskId: number): void {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.tasksSubject.next(this.tasks); // Emit the updated list
  }
}