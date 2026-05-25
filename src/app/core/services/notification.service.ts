import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);
  private next = 0;

  success(message: string): void { this.add('success', message); }
  error(message: string): void   { this.add('error', message); }
  info(message: string): void    { this.add('info', message); }

  dismiss(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  private add(type: Toast['type'], message: string): void {
    const id = ++this.next;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
