import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSignal = signal<Theme>('light');
  private themeSubject = new BehaviorSubject<Theme>('light');
  private isBrowser: boolean;

  theme$ = this.themeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Vérifie si on est dans un navigateur
    this.loadThemePreference();
  }

  private loadThemePreference(): void {
    if (this.isBrowser) {
      // Accéder à localStorage et window uniquement dans un navigateur
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // Vérifier la préférence de thème au niveau du système d'exploitation
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
    } else {
      // Utiliser un thème par défaut si on n'est pas dans un navigateur
      this.setTheme('light');
    }
  }

  getTheme(): Theme {
    return this.themeSignal();
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.themeSubject.next(theme);

    if (this.isBrowser) {
      localStorage.setItem('theme', theme);

      // Appliquer le thème au document
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }

  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}