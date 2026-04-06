import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../../../environments';
import { content, filters } from '../interfaces/enterprise.model';
@Injectable({
  providedIn: 'root',
})
export class MainSearchService {
  
  constructor( private http: HttpClient) {
  }

  private readonly baseUrl = environment.apiUrl;

  getAllServices(): Observable<content[]> {
    return this.http.get<content[]>(`${this.baseUrl}enterprise/filters`);
  }


}
