import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';
import { AttendanceReport } from '../../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private url: string = environment.apiUrl + '/report';
  constructor(private http: HttpClient) {}

  getKpis(): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(`${this.url}/kpis`);
  }

  getAttendanceReport(classId: number, date: string): Observable<AttendanceReport> {
    let params = new HttpParams();
    params = params.set('class_id', classId);
    params = params.set('date', date);

    return this.http.get<AttendanceReport>(`${this.url}/attendance-report`, { params });
  }
}
