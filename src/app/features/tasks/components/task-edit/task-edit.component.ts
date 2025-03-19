// TaskEditComponent.ts
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { DateTimeValidators } from '../../../../core/services/validators/dateTime.validator';

declare var bootstrap: any; // Declare Bootstrap 5

@Component({
    selector: 'task-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="modal fade" tabindex="-1"  #editModal>
        <div class="modal-dialog modal-lg modal-dialog-centered custom-modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Task</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" (click)="onCancel()"></button>
                </div>
                <div class="modal-body">
                    <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
                        <div class="mb-3">
                            <label for="edit-title" class="form-label">Title <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="edit-title" formControlName="title"
                                   [ngClass]="{ 'is-invalid': editForm.get('title')?.invalid && editForm.get('title')?.touched }"/>
                            <div *ngIf="editForm.get('title')?.invalid && editForm.get('title')?.touched" class="text-danger">
                                <div *ngIf="editForm.get('title')?.errors?.['required']">Title is required.</div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="edit-description" class="form-label">Description</label>
                            <textarea class="form-control" id="edit-description" formControlName="description" rows="2"></textarea>
                        </div>

                        <div class="mb-3">
                            <label for="edit-priority" class="form-label">Priority <span class="text-danger">*</span></label>
                            <select class="form-select" id="edit-priority" formControlName="priority">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div class="row mb-3">
                            <div class="col">
                                <label for="edit-dueDate" class="form-label">Due Date</label>
                                <input type="date" [min]="minDate" [max]="maxDate" class="form-control" id="edit-dueDate" formControlName="dueDate"/>
                                <div *ngIf="editForm.get('dueDate')?.invalid && editForm.get('dueDate')?.touched" class="text-danger">
                                    <div *ngIf="editForm.get('dueDate')?.errors?.['dateTooEarly']">Date cannot be in the past.</div>
                                    <div *ngIf="editForm.get('dueDate')?.errors?.['dateTooLate']">Date cannot be more than one year in the future.</div>
                                </div>
                            </div>

                            <div class="col">
                                <label for="time" class="form-label">Time (optional)</label>
                                <input type="time" class="form-control" id="time" formControlName="time" [disabled]="!editForm.get('dueDate')?.value"/>
                                <div *ngIf="editForm.get('time')?.invalid && editForm.get('time')?.touched" class="text-danger">
                                    <div *ngIf="editForm.get('time')?.errors?.['invalidTime']">The combined date and time must be in the future.</div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal" (click)="onCancel()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  `,
})
export class TaskEditComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() task!: Task;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<Task>();
    @Output() show = new EventEmitter<void>(); // Add show event


    @ViewChild('editModal') editModal!: ElementRef; // Reference to modal element
    private modalInstance: any; // Bootstrap modal instance

    editForm!: FormGroup;
    private taskService = inject(TaskService);
    private fb = inject(FormBuilder);

    minDate: any;
    maxDate: any;


    ngOnInit(): void {
        this.initForm();
        this.setupTimeField();
        this.minDate = new Date(new Date().setDate(new Date().getDate())).toISOString().slice(0, 10);
        this.maxDate = new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10);
    }

      ngAfterViewInit(): void {
        // Initialize Bootstrap modal *after* the view is initialized
        this.modalInstance = new bootstrap.Modal(this.editModal.nativeElement, {
           backdrop: 'static', // Prevent closing on outside click (optional)
           keyboard: false // Prevent closing with ESC key (optional)
        });

        // Listen for the modal's 'shown.bs.modal' event
        this.editModal.nativeElement.addEventListener('shown.bs.modal', () => {
          this.show.emit(); // Emit the 'show' event
      });

        // Listen for the modal's 'hidden.bs.modal' event
        this.editModal.nativeElement.addEventListener('hidden.bs.modal', () => {
            this.close.emit(); // Emit 'close' when modal is hidden
        });
    }

    ngOnDestroy(): void {
        // Dispose of the modal instance to prevent memory leaks
        if (this.modalInstance) {
            this.modalInstance.dispose();
        }
    }

    showModal() {
        this.modalInstance.show();
        this.resetForm();

    }
    hideModal() { // Add a hideModal method
        this.modalInstance.hide();
    }


    private initForm(): void {
        this.resetForm();
    }

    private setupTimeField(): void {
        this.editForm.get('dueDate')?.valueChanges.subscribe(dueDateValue => {
            const timeControl = this.editForm.get('time');
            if (dueDateValue) {
                timeControl?.enable();
            } else {
                timeControl?.disable();
                timeControl?.setValue('');
                timeControl?.clearValidators();
            }
            timeControl?.updateValueAndValidity();
        });

        // Force initial check
        if (this.editForm.get('dueDate')?.value) {
            this.editForm.get('time')?.enable();
        } else {
            this.editForm.get('time')?.disable();
            this.editForm.get('time')?.clearValidators();
        }
        this.editForm.get('time')?.updateValueAndValidity();
    }

    onSubmit(): void {
        if (this.editForm.invalid) {
            Object.values(this.editForm.controls).forEach(control => {
                control.markAsTouched();
            });
            return;
        }

        const formValue = this.editForm.value;
        let dueDate: Date | undefined;
        if (formValue.dueDate && formValue.time) {
            const [hours, minutes] = formValue.time.split(':');
            dueDate = new Date(formValue.dueDate);
            dueDate.setHours(Number(hours), Number(minutes));
            if (dueDate < new Date()) {
                this.editForm.get('time')?.setErrors({ invalidTime: true });
                return;
            }
        } else if (formValue.dueDate) {
            dueDate = new Date(formValue.dueDate);
        }

        const updatedTask: Task = {
            ...this.task,
            title: formValue.title,
            description: formValue.description,
            priority: formValue.priority,
            dueDate: dueDate
        };

        this.taskService.updateTask(updatedTask).subscribe(() => {
            this.saved.emit(updatedTask);  // Emit updated task
            this.modalInstance.hide();    // Hide modal on success
        });
    }

    onCancel(): void {
        this.close.emit(); // Emit close event.  *Important* for syncing with parent
        this.modalInstance.hide(); // Hide the modal
    }

     private resetForm() {
        let dueDateISO = '';
        let time = '';

        if (this.task && this.task.dueDate) { // Check if this.task is defined
            const date = new Date(this.task.dueDate);
            dueDateISO = date.toISOString().split('T')[0];
            time = date.toISOString().split('T')[1].substring(0, 5);
        }

        // Initialize the form *only* if it hasn't been already
        if (!this.editForm) {
            this.editForm = this.fb.group({
                title: [this.task ? this.task.title : '', Validators.required],  // Handle potential undefined task
                description: [this.task ? this.task.description : ''],
                priority: [this.task ? this.task.priority : 'medium', Validators.required],
                dueDate: [dueDateISO, DateTimeValidators.dateInRange()],
                time: [time]
            });
        } else {
            // If form exists, patch the values
            this.editForm.patchValue({
                title: this.task ? this.task.title : '', // Handle potential undefined task
                description: this.task ? this.task.description : '',
                priority: this.task ? this.task.priority : 'medium',
                dueDate: dueDateISO,
                time: time
            });
             // Reset the form's touched/untouched and pristine/dirty states
            Object.values(this.editForm.controls).forEach(control => {
                control.markAsUntouched();
                control.markAsPristine();
            });
        }
    }
}