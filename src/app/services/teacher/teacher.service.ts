import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';
import { TeacherInfo, TeacherReport } from '../../models/teacher.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private url: string = environment.apiUrl + '/teacher';
  constructor(private http: HttpClient) {}

  getAllTeacher(
    search: string,
    role: string,
    status: string,
    page: number,
    pageSize: number,
  ): Observable<TeacherInfo> {
    let params = new HttpParams();
    params = params.set('search', search);
    params = params.set('role', role);
    params = params.set('status', status);
    params = params.set('page', page.toString());
    params = params.set('pageSize', pageSize.toString());

    return this.http.get<TeacherInfo>(`${this.url}`, { params });
  }

  createTeacher(formData: FormData): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(`${this.url}`, formData);
  }

  updateTeacher(id: number, formData: FormData): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}`, formData);
  }

  getTeacherReport(): Observable<TeacherReport> {
    return this.http.get<TeacherReport>(`${this.url}/report`);
  }

  getTeacherById(id: number): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(`${this.url}/${id}`);
  }

  updateTeacherImage(id: number, formData: FormData): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}/image`, formData);
  }

  updateTeacherStatus(id: number, isActive: boolean): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}/status`, { is_active: isActive }); 
  }
}
