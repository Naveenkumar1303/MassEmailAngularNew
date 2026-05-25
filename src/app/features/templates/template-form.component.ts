import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TemplateService } from '@core/services/template.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './template-form.component.html',
  styleUrl: './template-form.component.scss'
})
export class TemplateFormComponent implements OnInit {
  @Input() id?: string;

  private readonly fb     = inject(FormBuilder);
  private readonly svc    = inject(TemplateService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  readonly isEdit      = signal(false);
  readonly saving      = signal(false);
  readonly previewHtml = signal<string | null>(null);

  readonly subjectPlaceholder = 'e.g. Your Monthly Update — {{Month}}';
  readonly placeholderHint    = '{{FirstName}}, {{UnsubscribeUrl}}, etc.';
  readonly htmlPlaceholder    = [
    '<!DOCTYPE html>', '<html>', '  <body>',
    '    <h1>Hello {{FirstName}}!</h1>',
    '    <a href="{{UnsubscribeUrl}}">Unsubscribe</a>',
    '  </body>', '</html>'
  ].join('\n');
  readonly plainPlaceholder  = 'Hello {{FirstName}},\n\n...\n\nUnsubscribe: {{UnsubscribeUrl}}';
  readonly placeholdersHint  = '["{{FirstName}}","{{Month}}","{{UnsubscribeUrl}}"]';

  readonly form = this.fb.group({
    name:         ['', Validators.required],
    subject:      ['', Validators.required],
    htmlBody:     ['', Validators.required],
    plainBody:    [''],
    placeholders: [''],
    isActive:     [true]
  });

  ngOnInit(): void {
    if (this.id) {
      this.isEdit.set(true);
      this.svc.getById(this.id).subscribe(t => {
        this.form.patchValue({
          name: t.name, subject: t.subject, htmlBody: t.htmlBody,
          plainBody: t.plainBody ?? '', placeholders: t.placeholders ?? '',
          isActive: t.isActive
        });
        this.updatePreview();
      });
    }
  }

  updatePreview(): void {
    this.previewHtml.set(this.form.get('htmlBody')?.value || null);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.saving.set(true);

    if (this.isEdit() && this.id) {
      this.svc.update(this.id, {
        name: v.name!, subject: v.subject!, htmlBody: v.htmlBody!,
        plainBody: v.plainBody || null, placeholders: v.placeholders || null,
        isActive: v.isActive ?? true
      }).subscribe({
        next: () => { this.notify.success('Template updated.'); this.router.navigate(['/templates']); },
        error: () => this.saving.set(false)
      });
    } else {
      this.svc.create({
        name: v.name!, subject: v.subject!, htmlBody: v.htmlBody!,
        plainBody: v.plainBody || null, placeholders: v.placeholders || null
      }).subscribe({
        next: () => { this.notify.success('Template created.'); this.router.navigate(['/templates']); },
        error: () => this.saving.set(false)
      });
    }
  }
}
