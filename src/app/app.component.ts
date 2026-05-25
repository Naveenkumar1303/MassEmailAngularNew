import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('routeFade', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  readonly notify = inject(NotificationService);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService).theme;
  readonly router = inject(Router);

  readonly showQueue = signal(false);
  readonly queueLink = signal<string[]>(['/campaigns']);
  readonly mobileMenuOpen = signal(false);
  readonly profileMenuOpen = signal(false);

  private readonly sub = new Subscription();

  ngOnInit(): void {
    this.updateFromUrl(this.router.url);
    this.sub.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(event => this.updateFromUrl(event.urlAfterRedirects))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleTheme(): void {
    inject(ThemeService).toggle();
  }

  toggleSidebar(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen.update(value => !value);
  }

  closeSidebar(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.profileMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.router.navigate(['/login']);
  }

  prepareRoute(outlet: RouterOutlet | null): string {
    return outlet?.activatedRouteData['animation'] ?? 'default';
  }

  private updateFromUrl(url: string): void {
    const match = url.match(/\/campaigns\/([^/?]+)\/queue/);

    if (match) {
      this.showQueue.set(true);
      this.queueLink.set(['/campaigns', match[1], 'queue']);
    } else {
      this.showQueue.set(false);
    }
  }
}
