// src/app/features/tasks/components/task-item/task-item.component.ts
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskEditComponent } from '../task-edit/task-edit.component';

declare var bootstrap: any;

@Component({
    selector: 'task-item',
    standalone: true,
    imports: [CommonModule, TaskEditComponent],
    templateUrl: './task-item.component.html',
    styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent implements OnInit, OnChanges, AfterViewInit {
    @Input({ required: true }) task!: Task;
    @Output() toggle = new EventEmitter<string>();
    @Output() delete = new EventEmitter<string>();
    @Output() update = new EventEmitter<Task>();

    @ViewChild('taskEditModal') taskEditModal!: TaskEditComponent;
    @ViewChild('deleteConfirmationModal') deleteConfirmationModal!: ElementRef;

    isEditing = false;
    private taskService = inject(TaskService);
    private deleteModalInstance: any;

    successMessage: string | null = null;
    errorMessage: string | null = null;

    constructor(private el: ElementRef) { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.deleteModalInstance = new bootstrap.Modal(this.deleteConfirmationModal.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    onToggle(): void {
        this.toggle.emit(this.task.id);
    }

    onConfirmDelete(): void {
        this.deleteModalInstance.show();
    }

    onDeleteConfirm(): void {
        this.deleteModalInstance.hide();
        this.taskService.deleteTask(this.task.id).subscribe({
            next: () => {
                this.delete.emit(this.task.id);
                // Déplacer l'affichage de l'alerte ici, après l'émission de l'événement
                this.successMessage = 'Task deleted successfully!';
                this.errorMessage = null;
                setTimeout(() => {
                    this.successMessage = null;
                }, 5000);
            },
            error: (error) => {
                console.error('Error deleting task:', error);
                this.errorMessage = 'Failed to delete task. Please try again.';
                this.successMessage = null;
                setTimeout(() => {
                    this.errorMessage = null;
                }, 5000);
            }
        });
    }

    onEdit(): void {
        this.isEditing = true;
        setTimeout(() => {
            this.taskEditModal.showModal();
        }, 0);
    }

    onSaved(updatedTask: Task): void {
        this.update.emit(updatedTask);
        this.loadTasks();
        this.successMessage = 'Task updated successfully!';
        this.errorMessage = null;

        setTimeout(() => {
            this.successMessage = null;
        }, 5000);
    }

    onModalShow() {
        this.isEditing = true;
    }

    loadTasks(): void {
        this.taskService.getTasks().subscribe({
            next: (tasks) => {
                this.task = tasks.find(t => t.id === this.task.id)!;
            },
            error: (error) => {
                console.error('Error loading tasks:', error);
                this.errorMessage = 'Failed to load tasks. Please try again.';
                this.successMessage = null;
                setTimeout(() => {
                    this.errorMessage = null;
                }, 5000);
            }
        });
    }
}