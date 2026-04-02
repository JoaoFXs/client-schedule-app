import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../../../environments';
@Injectable({
  providedIn: 'root',
})
export class MainSearchService {
  
  constructor( private http: HttpClient) {
  }

  private readonly baseUrl = environment.apiUrl;

  getAllServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}enterprise/services`);
  }


}
