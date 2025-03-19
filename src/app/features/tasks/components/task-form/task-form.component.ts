// TaskFormComponent.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { DateTimeValidators } from '../../../../core/services/validators/dateTime.validator';

@Component({
    selector: 'task-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="card mb-4">
        <div class="card-body">
            <h5 class="card-title">Add New Task</h5>

            <!-- Fixed Top-Right Alert Container -->
            <div class="alert-container">
                @if (successMessage) {
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ successMessage }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                } @else if (errorMessage) {
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    {{ errorMessage }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
                }
            </div>

            <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
                <!-- Title Field -->
                <div class="mb-3">
                    <label for="title" class="form-label">Title <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="title" formControlName="title" [ngClass]="{ 'is-invalid': taskForm.get('title')?.invalid && taskForm.get('title')?.touched }">
                    <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="text-danger">
                        <div *ngIf="taskForm.get('title')?.errors?.['required']">Title is required.</div>
                    </div>
                </div>

                <!-- Description Field -->
                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea class="form-control" id="description" formControlName="description" rows="2"></textarea>
                </div>

                <div class="mb-3">
                    <label for="priority" class="form-label">Priority <span class="text-danger">*</span></label>
                    <select class="form-select" id="priority" formControlName="priority" [ngClass]="{ 'is-invalid': taskForm.get('priority')?.invalid && taskForm.get('priority')?.touched }">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <div *ngIf="taskForm.get('priority')?.invalid && taskForm.get('priority')?.touched" class="text-danger">
                        Priority is required.
                    </div>
                </div>

                <!-- Priority and Due Date Fields -->
                <div class="row mb-3">

                    <div class="col">
                        <label for="dueDate" class="form-label">Due Date</label>
                        <input type="date" min={{minDate}} max={{maxDate}} class="form-control" id="dueDate" formControlName="dueDate" [ngClass]="{ 'is-invalid': taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched }">
                        <div *ngIf="taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched" class="text-danger">
                            <div *ngIf="taskForm.get('dueDate')?.errors?.['dateTooEarly']">Date cannot be in the past.</div>
                            <div *ngIf="taskForm.get('dueDate')?.errors?.['dateTooLate']">Date cannot be more than one year in the future.</div>
                        </div>
                    </div>

                    <div class="col">
                        <label for="time" class="form-label">Time (optional)</label>
                        <input type="time" class="form-control" id="time" formControlName="time" [ngClass]="{ 'is-invalid': taskForm.get('time')?.invalid && taskForm.get('time')?.touched }" [disabled]="!taskForm.get('dueDate')?.value">
                        <div *ngIf="taskForm.get('time')?.invalid && taskForm.get('time')?.touched" class="text-danger">
                            <div *ngIf="taskForm.get('time')?.errors?.['invalidTime']">The combined date and time must be in the future.</div>
                        </div>
                    </div>
                </div>

                <!-- Optional Time Field -->


                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">
                    <i class="fa fa-plus me-1"></i> Add Task
                </button>
            </form>
        </div>
    </div>
  `,
  styles: [`
    .alert-container {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000; /* Ensure it's on top of other elements */
      width: 300px; /* Adjust as needed */
    }
  `]
})
export class TaskFormComponent implements OnInit, OnDestroy {
    taskForm!: FormGroup;
    minDate: any;
    maxDate: any;
    successMessage: string | null = null;
    errorMessage: string | null = null;

    private destroy$ = new Subject<void>();  // Subject to manage unsubscriptions

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.setupTimeField();
        this.minDate = new Date(new Date().setDate(new Date().getDate())).toISOString().slice(0, 10); // Sets the minimum date as today
        this.maxDate = new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10); // Sets the maximum date to 31 December of the following year
    }

    ngOnDestroy(): void {
        this.destroy$.next(); // Trigger unsubscription
        this.destroy$.complete(); // Complete the Subject
    }

    private initForm(): void {
        this.taskForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            priority: ['medium', Validators.required],
            dueDate: ['', DateTimeValidators.dateInRange()],
            time: ['']
        });
    }

    private setupTimeField(): void {
        this.taskForm.get('dueDate')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(dueDateValue => {
            const timeControl = this.taskForm.get('time');
            if (dueDateValue) {
                timeControl?.enable();
                //timeControl?.setValidators([CustomValidators.timeFormat]);
            } else {
                timeControl?.disable();
                timeControl?.setValue(''); // Reset value
                timeControl?.clearValidators(); // Clear validators
            }
            timeControl?.updateValueAndValidity(); // Update form validity
        });

        //Force initial check
        if (this.taskForm.get('dueDate')?.value) {
            this.taskForm.get('time')?.enable();
            //this.taskForm.get('time')?.setValidators([CustomValidators.timeFormat]);
        } else {
            this.taskForm.get('time')?.disable();
            this.taskForm.get('time')?.clearValidators();
        }
        this.taskForm.get('time')?.updateValueAndValidity();
    }

    onSubmit(): void {
        if (this.taskForm.invalid) {
            Object.values(this.taskForm.controls).forEach(control => { //mark all fields as touched
                control.markAsTouched();
            });
            return;
        }

        const formValue = this.taskForm.value;

        let dueDate: Date | undefined;
        if (formValue.dueDate && formValue.time) {
            const [hours, minutes] = formValue.time.split(':');
            dueDate = new Date(formValue.dueDate);
            dueDate.setHours(Number(hours), Number(minutes));
            if (dueDate < new Date()) {
                this.taskForm.get('time')?.setErrors({ invalidTime: true });
                return;
            }
        } else if (formValue.dueDate) {
            dueDate = new Date(formValue.dueDate);
        }


        const newTask: Task = {
            title: formValue.title,
            description: formValue.description,
            priority: formValue.priority,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date(),
            id: ''
        };

        this.taskService.addTask(newTask).pipe(
            takeUntil(this.destroy$),
            tap({
                next: () => {
                    this.successMessage = 'Task added successfully!';
                    this.errorMessage = null;
                    this.taskForm.reset({
                        title: '',
                        description: '',
                        priority: 'medium',
                        dueDate: '',
                        time: ''
                    });

                    // Clear the success message after 5 seconds
                    setTimeout(() => {
                        this.successMessage = null;
                    }, 5000);


                },
                error: (error) => {
                    console.error('Error adding task:', error);
                    this.errorMessage = 'Failed to add task. Please try again.';
                    this.successMessage = null;

                    // Clear the error message after 5 seconds
                    setTimeout(() => {
                        this.errorMessage = null;
                    }, 5000);
                }
            })
        ).subscribe();
    }
}