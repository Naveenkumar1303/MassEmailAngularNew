import { effect, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'mass-email-theme';
  readonly theme = signal<'light' | 'dark'>(
    (localStorage.getItem(this.storageKey) as 'light' | 'dark' | null) ?? 'light'
  );

  readonly isDark = this.theme.asReadonly();

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.storageKey, theme);
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
  }
}
