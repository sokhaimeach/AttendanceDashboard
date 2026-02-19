import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = environment.apiUrl + '/auth';
  constructor(private http: HttpClient) {}

  resetPassword(id: number, newPassword: string): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}/reset-password`, { new_password: newPassword });
  }

  changePassword(id: number, oldPassword: string, newPassword: string): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}/change-password`, { old_password: oldPassword, new_password: newPassword });
  }
}
