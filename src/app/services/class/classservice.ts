import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Classservice {
  private url: string = environment.apiUrl + '/class';
  constructor(private http: HttpClient) {}

  // get all classes
  getAllClasses() {
    return this.http.get<{ data: any[] }>(this.url);
  }
}
