import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseInterface } from '../../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class Classservice {
  private url: string = environment.apiUrl + '/class';
  constructor(private http: HttpClient) {}

  // get all classes
  getAllClasses(): Observable<ResponseInterface> {
    return this.http.get<ResponseInterface>(this.url);
  }
}
