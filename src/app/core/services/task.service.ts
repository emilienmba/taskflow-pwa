import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Using signals for reactive data management (Angular 18 feature)
  private tasksSignal = signal<Task[]>([]);
  
  // Using BehaviorSubject for observable pattern
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  // Track online status
  private isOnline = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromLocalStorage();
    
    if (isPlatformBrowser(this.platformId)) {
      // Setup online/offline listeners
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleOnlineStatusChange(true));
      window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
    }
  }

  /**
   * Handles online/offline status changes
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    this.isOnline = isOnline;
    // Could trigger sync operations when coming back online
    if (isOnline) {
      console.log('Back online - data will be available');
    } else {
      console.log('Offline mode - using cached data');
    }
  }

  /**
   * Loads tasks from localStorage on service initialization
   */
  private loadFromLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        this.tasksSignal.set(tasks);
        this.tasksSubject.next(tasks);
      }
    }
  }

  /**
   * Saves the current tasks to localStorage
   */
  private saveToLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('tasks', JSON.stringify(this.tasksSignal()));
    }
  }

  /**
   * Gets all tasks as an Observable
   */
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  /**
   * Gets all tasks as a signal
   */
  getTasksSignal() {
    return this.tasksSignal;
  }

  /**
   * Adds a new task
   */
  addTask(task: Omit<Task, 'id' | 'createdAt'>): Observable<Task> {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
      completed: false
    };

    // Update both signal and subject
    const updatedTasks = [...this.tasksSignal(), newTask];
    this.tasksSignal.set(updatedTasks);
    this.tasksSubject.next(updatedTasks);
    
    this.saveToLocalStorage();
    return of(newTask);
  }

  /**
   * Updates an existing task
   */
  updateTask(updatedTask: Task): Observable<Task> {
    const updatedTasks = this.tasksSignal().map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    this.tasksSignal.set(updatedTasks);
    this.tasksSubject.next(updatedTasks);
    this.saveToLocalStorage();
    
    return of(updatedTask);
  }

  /**
   * Toggles the completed status of a task
   */
  toggleTaskCompletion(taskId: string): Observable<Task> {
    const taskToUpdate = this.tasksSignal().find(task => task.id === taskId);
    if (!taskToUpdate) {
      return of(null as unknown as Task);
    }
    
    const updatedTask = { 
      ...taskToUpdate, 
      completed: !taskToUpdate.completed 
    };
    
    return this.updateTask(updatedTask);
  }

  /**
   * Deletes a task by ID
   */
  deleteTask(taskId: string): Observable<boolean> {
    const updatedTasks = this.tasksSignal().filter(task => task.id !== taskId);
    
    this.tasksSignal.set(updatedTasks);
    this.tasksSubject.next(updatedTasks);
    this.saveToLocalStorage();
    
    return of(true);
  }
}