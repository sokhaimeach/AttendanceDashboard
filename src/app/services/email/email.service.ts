import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly url: string = `${environment.apiUrl}/email`;
  constructor(private http: HttpClient) {}

  sendEmail(form: {email: string, password: string, teacher_id: number}): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(`${this.url}/send`, form);
  }
}
