import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule], // Import standalone components
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
})
export class TaskItemComponent {
  @Input() task!: Task; // Input task data
  @Output() delete = new EventEmitter<number>(); // Event to delete the task
}