import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'campaigns',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/campaigns/campaign-list.component')
        .then(m => m.CampaignListComponent)
  },
  {
    path: 'campaigns/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/campaigns/campaign-form.component')
        .then(m => m.CampaignFormComponent)
  },
  {
    path: 'campaigns/:campaignId/queue',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/queue/queue.component')
        .then(m => m.QueueComponent)
  },
  {
    path: 'templates',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/templates/template-list.component')
        .then(m => m.TemplateListComponent)
  },
  {
    path: 'templates/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/templates/template-form.component')
        .then(m => m.TemplateFormComponent)
  },
  {
    path: 'templates/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/templates/template-form.component')
        .then(m => m.TemplateFormComponent)
  },
  { path: '**', redirectTo: 'login' }
];
