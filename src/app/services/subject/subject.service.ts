import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private readonly url = environment.apiUrl + '/subject';
  constructor(private http: HttpClient) {}

  getAllSubjects(search: string):Observable<ResponseInterface> {
    let params = new HttpParams();
    params = params.set('search', search);
    return this.http.get<ResponseInterface>(`${this.url}`, { params });
  }

  createSubject(subject_name: string): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(`${this.url}`, { subject_name });
  }

  updateSubject(id: number, subject_name: string): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${id}`, { subject_name });
  }

  deleteSubject(id: number): Observable<ResponseInterface> {
    return this.http.delete<ResponseInterface>(`${this.url}/${id}`);
  }
}
