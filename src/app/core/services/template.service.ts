import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  EmailTemplate, CreateTemplateRequest, UpdateTemplateRequest
} from '@core/models/models';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/templates`;

  list(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.base);
  }

  getById(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${this.base}/${id}`);
  }

  create(body: CreateTemplateRequest): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(this.base, body);
  }

  update(id: string, body: UpdateTemplateRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
