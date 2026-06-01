import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TrackingService } from '@core/services/tracking.service';
import { CampaignService } from '@core/services/campaign.service';
import { NotificationService } from '@core/services/notification.service';
import { Campaign, EmailTrackingItem, TrackingSummary } from '@core/models/models';

type ActiveTab = 'viewed' | 'not-viewed';

@Component({
  selector: 'app-campaign-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './campaign-tracking.component.html',
  styleUrl: './campaign-tracking.component.scss'
})
export class CampaignTrackingComponent implements OnInit {
  @Input() campaignId!: string;

  private readonly trackingSvc  = inject(TrackingService);
  private readonly campaignSvc  = inject(CampaignService);
  private readonly notify        = inject(NotificationService);

  readonly campaign    = signal<Campaign | null>(null);
  readonly summary     = signal<TrackingSummary | null>(null);
  readonly items       = signal<EmailTrackingItem[]>([]);
  readonly loading     = signal(true);
  readonly triggering  = signal(false);
  readonly activeTab   = signal<ActiveTab>('not-viewed');
  readonly page        = signal(1);
  readonly selectedIds = signal<Set<string>>(new Set<string>());

  search   = '';
  pageSize = 50;

  readonly filtered = () => {
    const q = this.search.toLowerCase();
    return this.items().filter(i =>
      !q ||
      i.recipientEmail.toLowerCase().includes(q) ||
      (i.recipientName ?? '').toLowerCase().includes(q)
    );
  };

  readonly canReTrigger = () => {
    const s = this.summary();
    return s && s.notViewed > 0;
  };

  readonly resendableCount = () =>
    this.activeTab() === 'not-viewed'
      ? this.items().filter(i => i.canResend).length
      : 0;

  readonly selectedCount = () => this.selectedIds().size;

  readonly isSelected = (id: string) => this.selectedIds().has(id);

  readonly isAllEligibleSelected = () => {
    const eligible = this.filtered().filter(i => i.canResend);
    return eligible.length > 0 && eligible.every(i => this.selectedIds().has(i.queueItemId));
  };

  ngOnInit(): void {
    this.load();
  }

  switchTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    this.page.set(1);
    this.search = '';
    this.selectedIds.set(new Set());
    this.loadItems();
  }

  changePage(p: number): void {
    this.page.set(p);
    this.selectedIds.set(new Set());
    this.loadItems();
  }

  toggleSelect(id: string): void {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectedIds.set(next);
  }

  toggleSelectAll(): void {
    const eligible = this.filtered().filter(i => i.canResend).map(i => i.queueItemId);
    const next = this.isAllEligibleSelected()
      ? new Set<string>()
      : new Set(eligible);
    this.selectedIds.set(next);
  }

  reTriggerSelected(): void {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    if (!confirm(`Re-send to ${ids.length} selected recipient(s)?`)) return;

    this.triggering.set(true);
    this.trackingSvc.reTriggerSelected(this.campaignId, ids).subscribe({
      next: res => {
        this.notify.success(`Re-triggered for ${res.retriggeredCount} recipient(s).`);
        this.triggering.set(false);
        this.selectedIds.set(new Set());
        this.load();
      },
      error: () => this.triggering.set(false)
    });
  }

  reTrigger(): void {
    const s = this.summary();
    if (!s || s.notViewed === 0) return;
    if (!confirm(
      `Re-send to ${s.notViewed} recipient(s) who have not viewed the email yet?\n\n` +
      `Only recipients who received the email but did not open it within 24 hours will be included.`
    )) return;

    this.triggering.set(true);
    this.trackingSvc.reTriggerNotViewed(this.campaignId).subscribe({
      next: res => {
        this.notify.success(`Re-triggered for ${res.retriggeredCount} recipient(s).`);
        this.triggering.set(false);
        this.load();
      },
      error: () => this.triggering.set(false)
    });
  }

  pct(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  hoursSince(dateStr: string): number {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000);
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      campaign: this.campaignSvc.getById(this.campaignId),
      summary:  this.trackingSvc.getSummary(this.campaignId)
    }).subscribe({
      next: ({ campaign, summary }) => {
        this.campaign.set(campaign);
        this.summary.set(summary);
        this.loadItems();
      },
      error: () => this.loading.set(false)
    });
  }

  private loadItems(): void {
    this.loading.set(true);
    const obs = this.activeTab() === 'viewed'
      ? this.trackingSvc.getViewed(this.campaignId, this.page(), this.pageSize)
      : this.trackingSvc.getNotViewed(this.campaignId, this.page(), this.pageSize);

    obs.subscribe({
      next: v  => { this.items.set(v); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
