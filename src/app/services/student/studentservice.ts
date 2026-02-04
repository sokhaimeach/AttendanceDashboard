import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Studentservice {
  private url: string = environment.apiUrl + '/student';

  constructor(private http: HttpClient) {}

  // create new student
  createStudent(student: any):Observable<{statusCode: number, message: string}> {
    return this.http.post<{statusCode: number, message: string}>(`${this.url}`, student);
  }

  // Get student by class ID
  getStudentsByClassId(
    classId: number,
    filterGender: string,
    search: string,
    sortOrder: string,
    page: number
  ): Observable<StudentInfo> {
    let params = new HttpParams();
    params = params.set('filterGender', filterGender);
    params = params.set('search', search);
    params = params.set('sortOrder', sortOrder);
    params = params.set('page', page);

    return this.http.get<StudentInfo>(
      `${this.url}/${classId}`,
      { params },
    );
  }

  // update student info
  updateStudentInfo(id: number, student: any){
    return this.http.put(`${this.url}/${id}`, student);
  }

  // delete student
  deleteStudent(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  // import file
  importStudentByFile(file: any):Observable<{data: any}> {
    return this.http.post<{data: any}>(`${this.url}/import`, file);
  }

  // download studend excel file
  downloadStudentExcel(classId: number){
    return this.http.get(`${this.url}/export/${classId}`, { responseType: 'blob'});
  }
}

interface StudentInfo {
  statusCode: number;
  message: string;
  data: {
    totalStudent: number;
    totalGirl: number;
    totalBoy: number;
    data: any[];
  }
}
