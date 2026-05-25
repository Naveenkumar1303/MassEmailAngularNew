# MassEmail Angular Frontend

Angular 17 frontend for the MassEmailSystem .NET 8 API.

## Tech stack
- Angular 17 (standalone components, signals, control flow @if/@for)
- TypeScript strict mode
- Reactive Forms
- HttpClient with functional interceptors

## Project structure
```
src/app/
├── core/
│   ├── models/models.ts              ← all interfaces matching API DTOs
│   ├── services/
│   │   ├── campaign.service.ts       ← GET/POST /api/campaigns
│   │   ├── template.service.ts       ← CRUD /api/templates
│   │   ├── health.service.ts         ← /health/ready
│   │   └── notification.service.ts  ← signal-based toast system
│   └── interceptors/
│       └── error.interceptor.ts     ← global HTTP error → toast
├── features/
│   ├── dashboard/
│   │   └── dashboard.component.ts   ← stats + health + recent campaigns
│   ├── campaigns/
│   │   ├── campaign-list.component.ts  ← paginated table, trigger button
│   │   └── campaign-form.component.ts  ← create campaign form
│   └── templates/
│       ├── template-list.component.ts  ← cards + live HTML preview
│       └── template-form.component.ts  ← create/edit + split preview
├── app.component.ts   ← sidebar shell + toast container
├── app.routes.ts      ← lazy-loaded routes
└── app.config.ts      ← providers: router, HttpClient, animations
```

## Quick start

### Prerequisites
- Node.js 18+
- Angular CLI 17+: `npm install -g @angular/cli`

### Steps
```bash
# Install dependencies
cd MassEmailAngular
npm install

# Start dev server (connects to http://localhost:5000 by default)
ng serve

# Open browser
http://localhost:4200
```

### Connecting to the API
Edit `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'   // ← your API URL here
};
```

### CORS — API must allow Angular origin
Add to your .NET API `Program.cs` before `app.UseRouting()`:
```csharp
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:4200")
     .AllowAnyHeader()
     .AllowAnyMethod()));
// ...
app.UseCors();
```

### Production build
```bash
ng build --configuration production
# Output in dist/mass-email-angular/
```

## Features

| Page | What it does |
|---|---|
| Dashboard | Stats (total sent, failed, running), health check badges (SQL + SES quota), recent campaigns table |
| Campaigns | Paginated + searchable table, status filter, one-click Trigger button, create new |
| New Campaign | Form with template picker, datetime scheduler, validation |
| Templates | Card grid with placeholders, live HTML preview in iframe, edit/delete |
| Template editor | Split-pane: form on left, live iframe preview on right (updates as you type) |

## Pages / routes
```
/dashboard          → DashboardComponent
/campaigns          → CampaignListComponent
/campaigns/new      → CampaignFormComponent
/templates          → TemplateListComponent
/templates/new      → TemplateFormComponent
/templates/:id/edit → TemplateFormComponent (edit mode)
```
