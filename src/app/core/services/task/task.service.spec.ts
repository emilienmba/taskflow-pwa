import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let localStorageMock: { [key: string]: string } = {};

  // Mock for localStorage
  beforeEach(() => {
    localStorageMock = {};
    
    spyOn(localStorage, 'getItem').and.callFake((key) => localStorageMock[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => localStorageMock[key] = value);
    spyOn(localStorage, 'removeItem').and.callFake((key) => delete localStorageMock[key]);
  });

  // Configure testing module to simulate browser environment
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Task Management', () => {
    it('should add a new task', async () => {
      const newTask = { 
        title: 'New task', 
        description: 'Description', 
        completed: false,
        priority: 'medium' as const,
        category: 'Work'
      };
      
      const result = await firstValueFrom(service.addTask(newTask));
      
      expect(result.title).toBe('New task');
      expect(result.description).toBe('Description');
      expect(result.completed).toBeFalse();
      expect(result.priority).toBe('medium');
      expect(result.id).toBeTruthy();
      expect(result.createdAt).toBeInstanceOf(Date);
      
      // Verify task is in the list
      const tasks = await firstValueFrom(service.getTasks());
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('New task');
    });

    it('should update an existing task', async () => {
      // Add a task first
      const newTask = { 
        title: 'Task to modify', 
        description: 'Description', 
        completed: false,
        priority: 'low' as const,
        category: 'Personal'
      };
      
      const addedTask = await firstValueFrom(service.addTask(newTask));
      
      // Modify the task
      const updatedTaskData = { 
        ...addedTask, 
        title: 'Modified task', 
        description: 'Modified description',
        priority: 'high' as const
      };
      
      const result = await firstValueFrom(service.updateTask(updatedTaskData));
      
      expect(result.title).toBe('Modified task');
      expect(result.description).toBe('Modified description');
      expect(result.priority).toBe('high');
      
      // Verify task is updated in the list
      const tasks = await firstValueFrom(service.getTasks());
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Modified task');
      expect(tasks[0].priority).toBe('high');
    });

    it('should toggle task completion status', async () => {
      // Add a task first
      const newTask = { 
        title: 'Task to complete', 
        description: 'Description',
        completed: false,
        priority: 'medium' as const
      };
      
      const addedTask = await firstValueFrom(service.addTask(newTask));
      expect(addedTask.completed).toBeFalse();
      
      // Toggle completion status
      const toggledTask = await firstValueFrom(service.toggleTaskCompletion(addedTask.id));
      expect(toggledTask.completed).toBeTrue();
      
      // Toggle again
      const toggledAgainTask = await firstValueFrom(service.toggleTaskCompletion(addedTask.id));
      expect(toggledAgainTask.completed).toBeFalse();
    });

    it('should delete a task', async () => {
      // Add a task first
      const newTask = { 
        title: 'Task to delete', 
        description: 'Description',
        completed: false,
        priority: 'medium' as const
      };
      
      const addedTask = await firstValueFrom(service.addTask(newTask));
      
      // Verify task exists
      let tasks = await firstValueFrom(service.getTasks());
      expect(tasks.length).toBe(1);
      
      // Delete the task
      const result = await firstValueFrom(service.deleteTask(addedTask.id));
      expect(result).toBeTrue();
      
      // Verify task no longer exists
      tasks = await firstValueFrom(service.getTasks());
      expect(tasks.length).toBe(0);
    });
  });

  describe('LocalStorage Management', () => {
    it('should save tasks to localStorage', async () => {
      const newTask = { 
        title: 'LocalStorage task', 
        description: 'Description',
        completed: false,
        priority: 'high' as const,
        category: 'Test'
      };
      
      await firstValueFrom(service.addTask(newTask));
      
      // Verify localStorage was called
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorageMock['tasks']).toBeTruthy();
      
      // Verify data is properly formatted
      const storedTasks = JSON.parse(localStorageMock['tasks']);
      expect(storedTasks.length).toBe(1);
      expect(storedTasks[0].title).toBe('LocalStorage task');
      expect(storedTasks[0].priority).toBe('high');
    });
  
    it('should load tasks from localStorage', (done) => {
      // Simulate data in localStorage avec string date au lieu d'objet Date
      const mockTasks = [
        { 
          id: '1', 
          title: 'Pre-existing task', 
          description: 'Description', 
          completed: false, 
          createdAt: new Date().toISOString(), // Utiliser string ISO au lieu de Date object
          priority: 'medium',
          category: 'Test'
        }
      ];
      
      localStorageMock['tasks'] = JSON.stringify(mockTasks);
      
      // Create new service instance to trigger loading
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TaskService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });
      const newService = TestBed.inject(TaskService);
      
      // Verify tasks are loaded
      newService.getTasks().subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe('Pre-existing task');
        expect(tasks[0].priority).toBe('medium');
        done(); // Important pour finaliser le test asynchrone
      });
    });
  });

  describe('Offline Mode Management', () => {
    it('should add pending changes when offline', async () => {
      // Simulate offline mode
      spyOnProperty(navigator, 'onLine').and.returnValue(false);
      service['isOnline'] = false;
      
      // Add a task
      const newTask = { 
        title: 'Offline task', 
        description: 'Description',
        completed: false,
        priority: 'low' as const
      };
      
      await firstValueFrom(service.addTask(newTask));
      
      // Verify pending changes are saved
      expect(localStorageMock['pendingChanges']).toBeTruthy();
      
      const pendingChanges = JSON.parse(localStorageMock['pendingChanges']);
      expect(pendingChanges.length).toBe(1);
      expect(pendingChanges[0].type).toBe('add');
      expect(pendingChanges[0].data.title).toBe('Offline task');
      expect(pendingChanges[0].data.priority).toBe('low');
    });

    it('should process pending changes when back online', () => {
      // Simulate pending changes
      const pendingChanges = [
        { 
          type: 'add', 
          data: { 
            id: '100', 
            title: 'Pending task', 
            description: 'Description', 
            completed: false,
            priority: 'medium'
          } 
        }
      ];
      
      localStorageMock['pendingChanges'] = JSON.stringify(pendingChanges);
      
      // Load pending changes
      service['loadPendingChanges']();
      
      // Spy on processing method
      spyOn(service as any, 'processPendingChanges');
      
      // Simulate coming back online
      service['handleOnlineStatusChange'](true);
      
      // Verify processing is called
      expect(service['processPendingChanges']).toHaveBeenCalled();
    });
  });

  describe('Signal Usage', () => {
    it('should expose tasks via a signal', async () => {
      const tasksSignal = service.getTasksSignal();
      expect(tasksSignal()).toEqual([]);
      
      // Add a task
      const newTask = { 
        title: 'Signal task', 
        description: 'Description',
        completed: false,
        priority: 'medium' as const
      };
      
      await firstValueFrom(service.addTask(newTask));
      
      // Verify signal is updated
      expect(tasksSignal().length).toBe(1);
      expect(tasksSignal()[0].title).toBe('Signal task');
      expect(tasksSignal()[0].priority).toBe('medium');
    });
  });
});