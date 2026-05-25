import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CampaignService } from '@core/services/campaign.service';
import { HealthService } from '@core/services/health.service';
import { Campaign, HealthCheckResult } from '@core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly campaignSvc = inject(CampaignService);
  private readonly healthSvc   = inject(HealthService);

  readonly campaigns = signal<Campaign[]>([]);
  readonly health    = signal<HealthCheckResult | null>(null);
  readonly loading   = signal(true);

  readonly totalSent    = () => this.campaigns().reduce((s, c) => s + c.sentCount, 0);
  readonly totalFailed  = () => this.campaigns().reduce((s, c) => s + c.failedCount, 0);
  readonly runningCount = () => this.campaigns().filter(c => c.status === 'Running').length;

  readonly healthEntries = () => {
    const h = this.health();
    if (!h?.checks) return [];
    return Object.entries(h.checks).map(([name, v]) => ({
      name,
      status: v.status,
      description: v.status === 'Degraded' ? 'Not configured (skipped)' : v.description,
      data: v.data as Record<string, unknown> | undefined
    }));
  };

  ngOnInit(): void {
    forkJoin({
      campaigns: this.campaignSvc.list({ page: 1, pageSize: 50 }),
      health:    this.healthSvc.getReady()
    }).subscribe({
      next: ({ campaigns, health }) => {
        this.campaigns.set(campaigns);
        this.health.set(health);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
