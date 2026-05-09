import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Address } from '../../interface/address.model';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient){
  }

  
getCurrentAddress(): Observable<Address> {
    console.log('Obtendo endereço atual...');
    return from(this.getCoords()).pipe( // Converte a Promise em Observable
      // Log das coordenadas, se bem-sucedido
      tap(coords => console.log('Coordenadas obtidas (no service):', coords)), 
      catchError(err => { // Captura erros da Promise getCoords()
        const userFriendlyMessage = this.getGeolocationErrorMessage(err);
        // Log a mensagem amigável junto com o erro bruto para depuração
        console.error('Erro ao obter coordenadas de geolocalização (no service):', userFriendlyMessage, err);
        // Re-lança o erro para que o subscriber final (no componente) possa tratá-lo com uma mensagem mais clara
        return throwError(() => new Error(`Erro de geolocalização: ${userFriendlyMessage}`));
      }),
      switchMap(({ lat, lng }) => {
        console.log(`Buscando endereço para Lat: ${lat}, Lng: ${lng}`);
        return this.http.get<any>(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'Accept-Language': 'pt-BR' } }
        ).pipe(
          tap(res => console.log('Resposta do Nominatim:', res)), // Log da resposta HTTP
          catchError(err => { // Captura erros da requisição HTTP do Nominatim
            console.error('Erro na requisição Nominatim:', err);
            return throwError(() => new Error('Erro ao buscar endereço: ' + err.message));
          })
        );
      }),
      map(res => ({
        street: res.address?.road ?? '',
        neighborhood: res.address?.suburb ?? res.address?.neighbourhood ?? '',
        city: res.address?.city ?? res.address?.town ?? res.address?.village ?? '',
        state: res.address?.state ?? '',
        country: res.address?.country ?? '',
        formatted: res.display_name ?? ''
      }))
    );
  }

  /**
   * Constrói uma mensagem de erro amigável a partir de um erro de geolocalização.
   * @param err O erro capturado.
   * @returns Uma string com a mensagem de erro.
   */
  private getGeolocationErrorMessage(err: any): string {
    if (typeof err === 'string') {
      return err; // Mensagem já é uma string
    } else if (err instanceof GeolocationPositionError) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          return 'Permissão de geolocalização negada. Por favor, permita o acesso à sua localização.';
        case err.POSITION_UNAVAILABLE:
          return 'Sua localização não pôde ser determinada. Verifique sua conexão ou tente novamente.';
        case err.TIMEOUT:
          return 'Tempo esgotado para obter sua localização. Tente novamente.';
        default:
          return err.message || `Erro de geolocalização desconhecido (código: ${err.code}).`;
      }
    } else if (err && err.message) {
      return err.message;
    }
    return 'Erro desconhecido ao obter sua localização.';
  }

private getCoords(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocalização não suportada pelo browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        console.warn('Geolocation falhou, usando coordenada de fallback:', err);
        // São Paulo como fallback — troca pela coordenada que quiser
        resolve({ lat: -23.5505, lng: -46.6333 });
      }
    );
  });
}
}
