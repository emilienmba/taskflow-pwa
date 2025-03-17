import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule], // Import standalone components
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent {
  @Output() addTask = new EventEmitter<Task>(); // Event to add a new task

  task: Task = {
    id: 0,
    title: '',
    description: '',
    completed: false,
  };

  /**
   * Handles form submission.
   */
  onSubmit(): void {
    this.addTask.emit(this.task);
    this.task = { id: 0, title: '', description: '', completed: false }; // Reset the form
  }
}