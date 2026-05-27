import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'mass-email-auth';
  readonly isAuthenticated = signal(true);

  login(email: string, password: string): boolean {
    if (!email.trim() || !password.trim()) {
      return false;
    }

    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ email: email.trim(), password: password.trim(), at: Date.now() })
    );
    this.isAuthenticated.set(true);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.isAuthenticated.set(false);
  }
}
