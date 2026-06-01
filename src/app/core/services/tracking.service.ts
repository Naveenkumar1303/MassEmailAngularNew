import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { EmailTrackingItem, TrackingSummary, ReTriggerResponse, ReTriggerSelectedRequest } from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly http = inject(HttpClient);

  private base(campaignId: string): string {
    return `${environment.apiUrl}/api/campaigns/${campaignId}/tracking`;
  }

  getSummary(campaignId: string): Observable<TrackingSummary> {
    return this.http.get<TrackingSummary>(`${this.base(campaignId)}/summary`);
  }

  getViewed(campaignId: string, page: number, pageSize: number): Observable<EmailTrackingItem[]> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<EmailTrackingItem[]>(`${this.base(campaignId)}/viewed`, { params });
  }

  getNotViewed(campaignId: string, page: number, pageSize: number): Observable<EmailTrackingItem[]> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<EmailTrackingItem[]>(`${this.base(campaignId)}/not-viewed`, { params });
  }

  reTriggerNotViewed(campaignId: string): Observable<ReTriggerResponse> {
    return this.http.post<ReTriggerResponse>(`${this.base(campaignId)}/retrigger-not-viewed`, {});
  }

  reTriggerSelected(campaignId: string, queueItemIds: string[]): Observable<ReTriggerResponse> {
    const body: ReTriggerSelectedRequest = { queueItemIds };
    return this.http.post<ReTriggerResponse>(`${this.base(campaignId)}/retrigger-selected`, body);
  }
}
