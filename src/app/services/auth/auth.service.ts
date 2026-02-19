import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponseInterface, ResponseInterface } from '../../models/response.model';
import { TeacherInterface } from '../../models/teacher.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = environment.apiUrl + '/auth';
  private TOKEN_KEY = 'attendance_access_token';
  private PROFILE_KEY = 'profile';
  constructor(private http: HttpClient) {}

  setToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  setTeacherProfile(teacher: TeacherInterface) {
    sessionStorage.setItem(this.PROFILE_KEY, JSON.stringify(teacher));
  }

  getTeacherProfile(): TeacherInterface {
    let teacher: any = sessionStorage.getItem(this.PROFILE_KEY);
    if(teacher) {
      teacher = JSON.parse(teacher);
    }
    return teacher;
  }

  hasRole(requiredRoles: string[]): boolean {
    const teacher = this.getTeacherProfile();
    if(!teacher) return false;
    return !!requiredRoles.includes(teacher?.role);
  }

  login(username: string, password: string): Observable<AuthResponseInterface> {
    return this.http.post<AuthResponseInterface>(`${this.url}/login`, { username, password });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.PROFILE_KEY);
  }

  resetPassword(id: number, newPassword: string): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}/reset-password`, { new_password: newPassword });
  }

  changePassword(id: number, oldPassword: string, newPassword: string): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}/change-password`, { old_password: oldPassword, new_password: newPassword });
  }
}
