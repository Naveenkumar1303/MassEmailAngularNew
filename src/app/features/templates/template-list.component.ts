import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '@core/services/template.service';
import { NotificationService } from '@core/services/notification.service';
import { EmailTemplate } from '@core/models/models';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './template-list.component.html',
  styleUrl: './template-list.component.scss'
})
export class TemplateListComponent implements OnInit {
  private readonly svc    = inject(TemplateService);
  private readonly notify = inject(NotificationService);

  readonly templates       = signal<EmailTemplate[]>([]);
  readonly loading         = signal(true);
  readonly deleting        = signal<string | null>(null);
  readonly previewTemplate = signal<EmailTemplate | null>(null);

  readonly placeholderLabel = '{{Placeholder}}';
  search = '';

  readonly filtered = () =>
    this.templates().filter(t =>
      t.name.toLowerCase().includes(this.search.toLowerCase())
    );

  ngOnInit(): void { this.load(); }

  parsePlaceholders(raw: string): string[] {
    try { return JSON.parse(raw) as string[]; } catch { return []; }
  }

  previewHtml(t: EmailTemplate): void { this.previewTemplate.set(t); }

  confirmDelete(t: EmailTemplate): void {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    this.deleting.set(t.id);
    this.svc.delete(t.id).subscribe({
      next: () => {
        this.notify.success(`Template "${t.name}" deleted.`);
        this.deleting.set(null);
        this.load();
      },
      error: () => this.deleting.set(null)
    });
  }

  private load(): void {
    this.svc.list().subscribe({
      next: v  => { this.templates.set(v); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
