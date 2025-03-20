// TaskFormComponent.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task/task.service';
import { DateTimeValidators } from '../../../../core/validators/dateTime.validator';

@Component({
    selector: 'task-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './task-form.component.html',
    styleUrls: ['./task-form.component.scss']
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