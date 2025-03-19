import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
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
export class AppComponent implements OnInit {
  updateAvailable = false;
  isOnline = true;
  offlineMode = false;
  offlineFallbackShown = false;

  private themeService = inject(ThemeService);
  isDarkTheme = false;

  constructor(
    private swUpdate: SwUpdate,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.themeService.theme$.subscribe(theme => {
      this.isDarkTheme = theme === 'dark';
    });
  }

  ngOnInit() {
    this.setupServiceWorkerUpdates();
    this.setupConnectivityMonitoring();
    this.checkServiceWorkerStatus();
  }

  /**
   * Sets up service worker update notifications
   */
  private setupServiceWorkerUpdates(): void {
    if (this.swUpdate.isEnabled) {
      // Check for updates every 30 minutes
      setInterval(() => {
        this.swUpdate.checkForUpdate().then(() => {
          console.log('Checking for updates');
        }).catch(err => {
          console.error('Error checking for updates:', err);
        });
      }, 30 * 60 * 1000);

      this.swUpdate.versionUpdates.pipe(
        filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY')
      ).subscribe(() => {
        console.log('New version available!');
        this.updateAvailable = true;
      });
    }
  }

  /**
   * Check if the service worker is active
   */
  private checkServiceWorkerStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            console.log('Service Worker is registered:', registration);
          } else {
            console.warn('No Service Worker registration found');
          }
        }).catch(err => {
          console.error('Service Worker error:', err);
        });
      }
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
        console.log('App is back online');
        this.isOnline = true;
        this.offlineMode = false;
        // Trigger a reload to get fresh data
        this.swUpdate.checkForUpdate();
      });
      
      window.addEventListener('offline', () => {
        console.log('App is offline');
        this.isOnline = false;
        this.offlineMode = true;
        
        // Show offline fallback if app content is not available
        setTimeout(() => {
          const appRoot = document.querySelector('app-root');
          if (appRoot && appRoot.children.length === 0) {
            const fallback = document.getElementById('offline-fallback');
            if (fallback) {
              fallback.style.display = 'block';
              this.offlineFallbackShown = true;
            }
          }
        }, 1000);
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
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        console.log('Update activated');
        document.location.reload();
      }).catch(err => {
        console.error('Error activating update:', err);
      });
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}