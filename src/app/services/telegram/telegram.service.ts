import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class TelegramService {
  private readonly url: string = `${environment.apiUrl}/telegram`;
  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(`${this.url}/send`, {message});
  }

  sendSupportMessage(message: string): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(`${this.url}/support`, {message});
  }
}
