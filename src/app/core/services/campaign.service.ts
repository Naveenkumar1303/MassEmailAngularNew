import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Campaign, CreateCampaignRequest, UpdateCampaignRequest, TriggerResponse, PageRequest } from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/campaigns`;

  list(page: PageRequest): Observable<Campaign[]> {
    const params = new HttpParams()
      .set('page', page.page)
      .set('pageSize', page.pageSize);
    return this.http.get<Campaign[]>(this.base, { params });
  }

  getById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.base}/${id}`);
  }

  create(body: CreateCampaignRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, body);
  }

  update(id: string, body: UpdateCampaignRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, body);
  }

  trigger(id: string): Observable<TriggerResponse> {
    return this.http.post<TriggerResponse>(`${this.base}/${id}/trigger`, {});
  }

  restart(id: string): Observable<{ message: string; id: string }> {
    return this.http.post<{ message: string; id: string }>(
      `${this.base}/${id}/restart`, {}
    );
  }
}
