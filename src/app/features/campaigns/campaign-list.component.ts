import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '@core/services/campaign.service';
import { NotificationService } from '@core/services/notification.service';
import { Campaign } from '@core/models/models';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './campaign-list.component.html',
  styleUrl: './campaign-list.component.scss'
})
export class CampaignListComponent implements OnInit {
  private readonly svc    = inject(CampaignService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly campaigns  = signal<Campaign[]>([]);
  readonly loading    = signal(true);
  readonly actioning  = signal<string | null>(null);
  readonly page       = signal(1);

  @Input() set status(val: string) { if (val) this.statusFilter = val; }

  search       = '';
  statusFilter = '';
  readonly pageSize = 12;

  readonly filtered = () =>
    this.campaigns().filter(c =>
      c.name.toLowerCase().includes(this.search.toLowerCase()) &&
      (!this.statusFilter || c.status === this.statusFilter)
    );

  readonly paginated = () => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  };

  readonly totalPages = () =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize));

  ngOnInit(): void {
    this.svc.list({ page: 1, pageSize: 100 }).subscribe({
      next: v  => { this.campaigns.set(v); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goToQueue(id: string): void {
    this.router.navigate(['/campaigns', id, 'queue']);
  }

  goToTracking(id: string): void {
    this.router.navigate(['/campaigns', id, 'tracking']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/campaigns', id, 'edit']);
  }

  trigger(c: Campaign): void {
    this.actioning.set(c.id);
    this.svc.trigger(c.id).subscribe({
      next: () => {
        this.notify.success(`Campaign "${c.name}" triggered.`);
        this.actioning.set(null);
        this.reload();
      },
      error: () => this.actioning.set(null)
    });
  }

  restart(c: Campaign): void {
    if (!confirm(`Restart "${c.name}"?\n\nAll Failed emails will be reset to Pending and re-sent.`))
      return;
    this.actioning.set(c.id);
    this.svc.restart(c.id).subscribe({
      next: () => {
        this.notify.success(`Campaign "${c.name}" restarted.`);
        this.actioning.set(null);
        this.reload();
      },
      error: () => this.actioning.set(null)
    });
  }

  private reload(): void {
    this.svc.list({ page: 1, pageSize: 100 }).subscribe(
      v => this.campaigns.set(v)
    );
  }
}
