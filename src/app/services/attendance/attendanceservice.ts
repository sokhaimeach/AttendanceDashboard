import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';
import { CreateAttendanceInterface } from '../../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class Attendanceservice {
  private url: string = `${environment.apiUrl}/attendance`;
  constructor(private http: HttpClient) {}

  getAttendanceReportByClass(classId: number, date: string, search: string, status: number):Observable<ResponseInterface> {
    let params = new HttpParams();
    params = params.set("date", date);
    params = params.set("search", search);
    params = params.set("status", status);

    return this.http.get<ResponseInterface>(`${this.url}/${classId}`, {params});
  }

  getSchedule(): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(`${this.url}/schedule`);
  }

  createManyAttendances(attendances: CreateAttendanceInterface[]):Observable<ResponseInterface> {
    return this.http.post<ResponseInterface>(`${this.url}/bulk-create`, attendances);
  }

  updateAttendanceStatus(attendanceId: number, status: number):Observable<ResponseInterface> {
    return this.http.put<ResponseInterface>(`${this.url}/${attendanceId}`, { status });
  }

  downloadAttendance(classId: number) {
    return this.http.get(`${this.url}/export/${classId}`, {responseType: 'blob'});
  }
}
