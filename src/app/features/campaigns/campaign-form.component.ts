import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampaignService } from '@core/services/campaign.service';
import { TemplateService } from '@core/services/template.service';
import { NotificationService } from '@core/services/notification.service';
import { EmailTemplate } from '@core/models/models';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './campaign-form.component.html',
  styleUrl: './campaign-form.component.scss'
})
export class CampaignFormComponent implements OnInit {
  private readonly fb      = inject(FormBuilder);
  private readonly svc     = inject(CampaignService);
  private readonly tmplSvc = inject(TemplateService);
  private readonly notify  = inject(NotificationService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);

  readonly templates  = signal<EmailTemplate[]>([]);
  readonly saving     = signal(false);
  readonly loading    = signal(false);

  editId: string | null = null;
  get isEditMode(): boolean { return !!this.editId; }

  readonly placeholderSyntax  = '{{Placeholder}}';
  readonly subjectPlaceholder = 'e.g. Your Monthly Update — {{Month}}';

  readonly form = this.fb.group({
    name:        ['', Validators.required],
    subject:     ['', Validators.required],
    fromName:    ['', Validators.required],
    fromEmail:   ['', [Validators.required, Validators.email]],
    templateId:  ['', Validators.required],
    scheduledAt: ['', Validators.required]
  });

  ngOnInit(): void {
    this.tmplSvc.list().subscribe(t => this.templates.set(t));

    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.loading.set(true);
      this.svc.getById(this.editId).subscribe({
        next: c => {
          const local = c.scheduledAt
            ? new Date(c.scheduledAt).toISOString().slice(0, 16)
            : '';
          this.form.patchValue({
            name:        c.name,
            subject:     c.subject ?? '',
            fromName:    c.fromName ?? '',
            fromEmail:   c.fromEmail ?? '',
            templateId:  c.templateId ?? '',
            scheduledAt: local
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.router.navigate(['/campaigns']);
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const payload = {
      name:        v.name!,
      subject:     v.subject!,
      fromName:    v.fromName!,
      fromEmail:   v.fromEmail!,
      templateId:  v.templateId!,
      scheduledAt: new Date(v.scheduledAt!).toISOString()
    };

    this.saving.set(true);

    if (this.isEditMode) {
      this.svc.update(this.editId!, payload).subscribe({
        next: () => {
          this.notify.success('Campaign updated successfully.');
          this.router.navigate(['/campaigns']);
        },
        error: () => this.saving.set(false)
      });
    } else {
      this.svc.create(payload).subscribe({
        next: () => {
          this.notify.success('Campaign created successfully.');
          this.router.navigate(['/campaigns']);
        },
        error: () => this.saving.set(false)
      });
    }
  }
}
