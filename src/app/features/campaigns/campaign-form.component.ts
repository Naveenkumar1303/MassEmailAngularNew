import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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

  readonly templates = signal<EmailTemplate[]>([]);
  readonly saving    = signal(false);

  readonly placeholderSyntax  = '{{Placeholder}}';
  readonly subjectPlaceholder = 'e.g. Your Monthly Update — {{Month}}';

  readonly form = this.fb.group({
    name:        ['', Validators.required],
    subject:     ['', Validators.required],
    templateId:  ['', Validators.required],
    scheduledAt: ['', Validators.required]
  });

  ngOnInit(): void {
    this.tmplSvc.list().subscribe(t => this.templates.set(t));
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.saving.set(true);
    this.svc.create({
      name:        v.name!,
      subject:     v.subject!,
      templateId:  v.templateId!,
      scheduledAt: new Date(v.scheduledAt!).toISOString()
    }).subscribe({
      next: () => {
        this.notify.success('Campaign created successfully.');
        this.router.navigate(['/campaigns']);
      },
      error: () => this.saving.set(false)
    });
  }
}
