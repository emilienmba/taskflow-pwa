import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { ThemeService } from './core/services/theme.service';
import { TaskFormComponent } from './features/tasks/components/task-form/task-form.component';
import { TaskListComponent } from './features/tasks/components/task-list/task-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TaskListComponent,
    TaskFormComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  updateAvailable = false;
  isOnline = true;
  offlineMode = false; // New property to track if we're operating in offline mode

  private themeService = inject(ThemeService);
  isDarkTheme = false;

  constructor(
    private swUpdate: SwUpdate,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.setupServiceWorkerUpdates();
    this.setupConnectivityMonitoring();
    
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });
  }

  /**
   * Sets up service worker update notifications
   */
  private setupServiceWorkerUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY')
      ).subscribe(() => {
        this.updateAvailable = true;
      });
    }
  }

  /**
   * Monitors device online/offline status
   */
  private setupConnectivityMonitoring(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline = navigator.onLine;
      this.offlineMode = !navigator.onLine;

      window.addEventListener('online', () => {
        this.isOnline = true;
        this.offlineMode = false;
        console.log('App is online');
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.offlineMode = true;
        console.log('App is offline');
      });
      
      // Check if app was loaded in offline mode
      if (!navigator.onLine) {
        this.offlineMode = true;
      }
    }
  }

  /**
   * Updates the application when a new version is available
   */
  updateApp(): void {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}