import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Task } from './core/models/task.model';
import { TaskService } from './core/services/task.service';
import { TaskFormComponent } from './features/task-form/task-form.component';
import { TaskListComponent } from './features/task-list/task-list.component';
;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showInstallButton = false; // Whether to show the install button
  private deferredPrompt: any; // Stores the PWA install prompt

  constructor(
    private taskService: TaskService,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID to check the environment
  ) {
    // Only add the event listener if running in a browser
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.deferredPrompt = event;
        this.showInstallButton = true;
      });
    }
  }

  /**
   * Handles the installation of the PWA.
   */
  installPwa(): void {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
        this.showInstallButton = false;
      });
    }
  }

  /**
   * Handles adding a new task.
   * @param task - The task to add.
   */
  onAddTask(task: Task): void {
    this.taskService.addTask(task);
  }
}