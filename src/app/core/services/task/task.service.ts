import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Task } from '../../models/task.model';

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
  private pendingChanges: {type: string, data: any}[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromLocalStorage();
   
    if (isPlatformBrowser(this.platformId)) {
      // Setup online/offline listeners
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleOnlineStatusChange(true));
      window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
      
      // Load any pending changes from storage
      this.loadPendingChanges();
    }
  }

  /**
   * Handles online/offline status changes
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    this.isOnline = isOnline;
    
    // Process pending changes when back online
    if (isOnline && this.pendingChanges.length > 0) {
      console.log('Back online - processing pending changes');
      this.processPendingChanges();
    } else if (!isOnline) {
      console.log('Offline mode - changes will be cached');
    }
  }

  /**
   * Loads pending changes from localStorage
   */
  private loadPendingChanges(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedChanges = localStorage.getItem('pendingChanges');
      if (savedChanges) {
        this.pendingChanges = JSON.parse(savedChanges);
      }
    }
  }

  /**
   * Saves pending changes to localStorage
   */
  private savePendingChanges(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pendingChanges', JSON.stringify(this.pendingChanges));
    }
  }

  /**
   * Process pending changes when back online
   */
  private processPendingChanges(): void {
    if (this.pendingChanges.length === 0) return;

    // Process each pending change
    // In a real app, this would sync with your backend
    console.log('Processing pending changes:', this.pendingChanges);
    
    // Clear pending changes after processing
    this.pendingChanges = [];
    this.savePendingChanges();
  }

  /**
   * Loads tasks from localStorage on service initialization
   */
  private loadFromLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks);
          this.tasksSignal.set(tasks);
          this.tasksSubject.next(tasks);
        } catch (error) {
          console.error('Error parsing tasks from localStorage:', error);
          // Initialize with empty array if parsing fails
          this.tasksSignal.set([]);
          this.tasksSubject.next([]);
        }
      }
    }
  }

  /**
   * Saves the current tasks to localStorage
   */
  private saveToLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('tasks', JSON.stringify(this.tasksSignal()));
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
      }
    }
  }

  /**
   * Adds a change to the pending changes queue
   */
  private addPendingChange(type: string, data: any): void {
    if (!this.isOnline) {
      this.pendingChanges.push({ type, data });
      this.savePendingChanges();
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
    
    // Add to pending changes if offline
    if (!this.isOnline) {
      this.addPendingChange('add', newTask);
    }
    
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
    
    // Add to pending changes if offline
    if (!this.isOnline) {
      this.addPendingChange('update', updatedTask);
    }
   
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
    
    // Add to pending changes if offline
    if (!this.isOnline) {
      this.addPendingChange('delete', taskId);
    }
   
    return of(true);
  }
}