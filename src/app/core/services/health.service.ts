import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { HealthCheckResult } from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/health`;

  /**
   * GET /api/health/ready
   * Checks SQL Server + SES. Returns Healthy/Degraded/Unhealthy.
   * On 503 (degraded/unhealthy) the body still contains check details.
   */
  getReady(): Observable<HealthCheckResult> {
    return this.http.get<HealthCheckResult>(`${this.base}/ready`);
  }

  /**
   * GET /api/health/live
   * Liveness only — always 200 if process is up.
   */
  getLive(): Observable<HealthCheckResult> {
    return this.http.get<HealthCheckResult>(`${this.base}/live`).pipe(
      catchError(() => of({ status: 'Unhealthy', checks: {} } as HealthCheckResult))
    );
  }

  /**
   * GET /api/health
   * Full check — all registered health checks.
   */
  getFull(): Observable<HealthCheckResult> {
    return this.http.get<HealthCheckResult>(this.base).pipe(
      catchError((err) =>
        of(err?.error && typeof err.error === 'object'
          ? err.error as HealthCheckResult
          : { status: 'Unhealthy', checks: {} } as HealthCheckResult
        )
      )
    );
  }
}
