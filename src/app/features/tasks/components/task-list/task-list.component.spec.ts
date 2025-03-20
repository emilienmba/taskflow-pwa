// import { CommonModule } from '@angular/common';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { By } from '@angular/platform-browser';
// import { of } from 'rxjs';
// import { Task } from '../../../../core/models/task.model';
// import { TaskService } from '../../../../core/services/task/task.service';
// import { TaskItemComponent } from '../task-item/task-item.component';
// import { TaskListComponent } from './task-list.component';

// describe('TaskListComponent', () => {
//   let component: TaskListComponent;
//   let fixture: ComponentFixture<TaskListComponent>;
//   let taskService: jasmine.SpyObj<TaskService>;

//   const mockTasks: Task[] = [
//     { id: '1', title: 'Task 1', description: 'Description 1', completed: false, createdAt: new Date(), priority: 'low', dueDate: new Date('2024-01-01') },
//     { id: '2', title: 'Task 2', description: 'Description 2', completed: true, createdAt: new Date(), priority: 'medium', dueDate: new Date('2024-01-02') },
//     { id: '3', title: 'Task 3', description: 'Description 3', completed: false, createdAt: new Date(), priority: 'high', dueDate: new Date('2024-01-03') },
//   ];

//   beforeEach(async () => {
//     taskService = jasmine.createSpyObj('TaskService', ['getTasks', 'toggleTaskCompletion', 'deleteTask', 'updateTask']);
//     taskService.getTasks.and.returnValue(of(mockTasks));
//     taskService.toggleTaskCompletion.and.returnValue(of({} as Task));
//     taskService.deleteTask.and.returnValue(of(true)); // Correction ici
//     taskService.updateTask.and.returnValue(of({} as Task));

//     await TestBed.configureTestingModule({
//       imports: [TaskListComponent, CommonModule, ReactiveFormsModule, TaskItemComponent],
//       providers: [{ provide: TaskService, useValue: taskService }],
//     }).compileComponents();

//     fixture = TestBed.createComponent(TaskListComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should load tasks on initialization', () => {
//     expect(taskService.getTasks).toHaveBeenCalled();
//     component.filteredTasks$.subscribe(tasks => {
//       expect(tasks).toEqual(mockTasks);
//     });
//   });

//   it('should filter tasks by active', () => {
//     component.setFilter('active');
//     fixture.detectChanges();

//     component.filteredTasks$.subscribe(tasks => {
//       expect(tasks.length).toBe(2);
//       expect(tasks.every(task => !task.completed)).toBeTrue();
//     });
//   });

//   it('should filter tasks by completed', () => {
//     component.setFilter('completed');
//     fixture.detectChanges();

//     component.filteredTasks$.subscribe(tasks => {
//       expect(tasks.length).toBe(1);
//       expect(tasks.every(task => task.completed)).toBeTrue();
//     });
//   });

//   it('should filter tasks by search term', () => {
//     component.searchControl.setValue('Task 1');
//     fixture.detectChanges();

//     component.filteredTasks$.subscribe(tasks => {
//       expect(tasks.length).toBe(1);
//       expect(tasks[0].title).toBe('Task 1');
//     });
//   });

//   it('should sort tasks by due date', () => {
//     component.setSort('dueDate');
//     fixture.detectChanges();

//     component.filteredTasks$.subscribe(tasks => {
//       expect(tasks[0].id).toBe('1');
//       expect(tasks[1].id).toBe('2');
//       expect(tasks[2].id).toBe('3');
//     });
//   });

//   it('should sort tasks by priority', () => {
//     component.setSort('priority');
//     fixture.detectChanges();

//     component.filteredTasks$.subscribe(tasks => {
//       expect(tasks[0].id).toBe('3');
//       expect(tasks[1].id).toBe('2');
//       expect(tasks[2].id).toBe('1');
//     });
//   });

//   it('should toggle task completion', () => {
//     component.onToggleTask('1');
//     expect(taskService.toggleTaskCompletion).toHaveBeenCalledWith('1');
//   });

//   it('should delete a task', () => {
//     component.onDeleteTask('1');
//     expect(taskService.deleteTask).toHaveBeenCalledWith('1');
//   });

//   it('should update a task', () => {
//     const updatedTask: Task = { ...mockTasks[0], title: 'Updated Task' };
//     component.onUpdateTask(updatedTask);
//     expect(taskService.updateTask).toHaveBeenCalledWith(updatedTask);
//   });

//   it('should clear the search input', () => {
//     component.searchControl.setValue('test');
//     component.clearSearch();
//     expect(component.searchControl.value).toBe('');
//   });

//   it('should display task items', () => {
//     const taskItems = fixture.debugElement.queryAll(By.directive(TaskItemComponent));
//     expect(taskItems.length).toBe(mockTasks.length);
//   });

//   it('should display no task message when filteredTasks is empty', () => {
//     taskService.getTasks.and.returnValue(of([]));
//     component.filteredTasks$.subscribe(tasks => {
//         fixture.detectChanges();
//         const noTaskMessage = fixture.debugElement.query(By.css('.no-tasks-message'));
//         expect(noTaskMessage).toBeTruthy();
//     });
//   });

//   it('should set the filter value correctly', () => {
//     component.setFilter('active');
//     expect(component.filter.value).toBe('active');
//   });

//   it('should set the sort value correctly', () => {
//     component.setSort('dueDate');
//     expect(component.sort.value).toBe('dueDate');
//   });
// });