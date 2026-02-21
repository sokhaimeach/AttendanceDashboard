import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponseInterface, ResponseInterface } from '../../models/response.model';
import { TeacherInterface, TeacherResponeInterface } from '../../models/teacher.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url: string = environment.apiUrl + '/auth';
  private TOKEN_KEY = 'attendance_access_token';
  private PROFILE_KEY = 'profile';
  private currentUserRole = '';
  private currentUser = signal<TeacherInterface>({} as TeacherInterface);
  constructor(private http: HttpClient) {}

  setToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  setTeacherProfile(teacher: TeacherInterface) {
    this.currentUser.set(teacher);
  }

  getTeacherProfile() {
    return this.currentUser;
  }

  getLoggedInByToken(): Observable<TeacherResponeInterface> {
    return this.http.get<TeacherResponeInterface>(`${this.url}/loggedIn`);
  }

  restoreTeacherRoleFromToken() {
    const token = this.getToken();
    if(token) {
      const decoded: any = jwtDecode(token);
      this.currentUserRole = decoded.role;
    }
  }

  hasRole(requiredRoles: string[]): boolean {
    if(!this.currentUserRole) return false;
    return !!requiredRoles.includes(this.currentUserRole);
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
