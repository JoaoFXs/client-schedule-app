import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../../../environments';
import { content, enterprise, filters } from '../interfaces/enterprise.model';
@Injectable({
  providedIn: 'root',
})
export class MainSearchService {
  
  constructor( private http: HttpClient) {
  }

  private readonly baseUrl = environment.apiUrl;

  getAllServices(): Observable<enterprise[]> {
    return this.http.get<enterprise[]>(`${this.baseUrl}enterprise/filters`);
  }

  getAllEnterprises(page: number = 0, size: number = 10, selectedFilters: Set<filters>, myControl: string): Observable<enterprise[]> {
    if(myControl == null){
      myControl = ''
    }
    
    const params: any = {
      page: page,
      size: size,
      service: Array.from(selectedFilters).map(filter => filter.service).join(','), // Converte o Set de filtros em uma string separada por vírgulas,
      uf: Array.from(selectedFilters).map(filter => filter.uf).join(','),
      city: Array.from(selectedFilters).map(filter => filter.city).join(','),
      address: Array.from(selectedFilters).map(filter => filter.address).join(','),
      name: myControl // Adiciona o valor do campo de controle ao objeto de parâmetros
    };

    return this.http.get<enterprise[]>(`${this.baseUrl}enterprise`, { params });
  }


}
