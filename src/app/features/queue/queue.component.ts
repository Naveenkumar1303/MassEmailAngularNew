import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QueueService } from '@core/services/queue.service';
import { CampaignService } from '@core/services/campaign.service';
import { NotificationService } from '@core/services/notification.service';
import { QueueItem, QueueSummary, Campaign } from '@core/models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.scss'
})
export class QueueComponent implements OnInit {
  @Input() campaignId!: string;
  @Input() set status(val: string) { if (val) this.statusFilter = val; }

  private readonly queueSvc    = inject(QueueService);
  private readonly campaignSvc = inject(CampaignService);
  private readonly notify      = inject(NotificationService);

  readonly summary      = signal<QueueSummary | null>(null);
  readonly items        = signal<QueueItem[]>([]);
  readonly campaign     = signal<Campaign | null>(null);
  readonly loading      = signal(true);
  readonly page         = signal(1);
  readonly selectedItem = signal<QueueItem | null>(null);
  readonly retrying     = signal<string | null>(null);

  statusFilter = '';
  search       = '';
  pageSize     = 50;

  readonly filtered = () =>
    this.items().filter(i =>
      !this.search ||
      i.recipientEmail.toLowerCase().includes(this.search.toLowerCase()) ||
      (i.recipientName ?? '').toLowerCase().includes(this.search.toLowerCase())
    );

  pct(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  ngOnInit(): void { this.reload(); }

  selectItem(item: QueueItem): void {
    this.selectedItem.set(
      this.selectedItem()?.id === item.id ? null : item
    );
  }

  applyFilter(status: string): void {
    this.statusFilter = status;
    this.page.set(1);
    this.selectedItem.set(null);
    this.loadItems();
  }

  changePage(p: number): void {
    this.page.set(p);
    this.selectedItem.set(null);
    this.loadItems();
  }

  retryItem(item: QueueItem): void {
    this.retrying.set(item.id);
    this.queueSvc.retryItem(this.campaignId, item.id).subscribe({
      next: () => {
        this.notify.success(`Retry queued for ${item.recipientEmail}`);
        this.retrying.set(null);
        this.reload();
      },
      error: () => this.retrying.set(null)
    });
  }

  reload(): void {
    this.loading.set(true);
    forkJoin({
      summary:  this.queueSvc.getSummary(this.campaignId),
      items:    this.queueSvc.getItems(this.campaignId, this.statusFilter || null, this.page(), this.pageSize),
      campaign: this.campaignSvc.getById(this.campaignId)
    }).subscribe({
      next: ({ summary, items, campaign }) => {
        this.summary.set(summary);
        this.items.set(items);
        this.campaign.set(campaign);
        this.loading.set(false);
        if (this.selectedItem()) {
          const updated = items.find(i => i.id === this.selectedItem()!.id);
          this.selectedItem.set(updated ?? null);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  private loadItems(): void {
    this.loading.set(true);
    this.queueSvc.getItems(this.campaignId, this.statusFilter || null, this.page(), this.pageSize)
      .subscribe({
        next: v  => { this.items.set(v); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }
}
