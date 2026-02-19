import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class Classservice {
  private url: string = environment.apiUrl + '/class';
  constructor(private http: HttpClient) {}

  // get all classes
  getAllClasses(search: string): Observable<ResponseInterface> {
    let params = new HttpParams();
    params = params.set('search', search);

    return this.http.get<ResponseInterface>(this.url, { params });
  }

  createClass(className: string): Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(this.url, { class_name: className });
  }

  updateClass(classId: number, className: string): Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${classId}`, { class_name: className });
  }

  deleteClass(classId: number): Observable<ResponseInterface> {
    return this.http.delete<ResponseInterface>(`${this.url}/${classId}`);
  }
}
