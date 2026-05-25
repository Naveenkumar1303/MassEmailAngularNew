import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { QueueItem, QueueSummary } from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class QueueService {
  private readonly http = inject(HttpClient);

  private base(campaignId: string): string {
    return `${environment.apiUrl}/api/campaigns/${campaignId}/queue`;
  }

  getSummary(campaignId: string): Observable<QueueSummary> {
    return this.http.get<QueueSummary>(`${this.base(campaignId)}/summary`);
  }

  getItems(
    campaignId: string,
    status: string | null,
    page: number,
    pageSize: number
  ): Observable<QueueItem[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    return this.http.get<QueueItem[]>(this.base(campaignId), { params });
  }

  retryItem(
    campaignId: string,
    itemId: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base(campaignId)}/${itemId}/retry`, {}
    );
  }
}
