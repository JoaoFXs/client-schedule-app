import { Component } from '@angular/core';
import { Address } from '../../interface/address.model';
import { LocationService } from '../../../_shared/services/location/location.service';

@Component({
  selector: 'app-permission-location',
  templateUrl: './permission-location.component.html',
  styleUrl: './permission-location.component.scss',
  standalone: false
})
export class PermissionLocationComponent {

  constructor(private locationService: LocationService) {}

  showPrompt = false;
  address?  : Address;
  loading    = false;
  error?    : string;

  open(): void {
    this.showPrompt = true;
  }

  allow(): void {
    this.showPrompt = false;
    this.getAddress();        // chama direto, sem emitir pro pai
  }

  deny(): void {
    this.showPrompt = false;
    this.error = 'Permissão negada para acessar a localização.';
  }

  private getAddress(): void {
    this.loading = true;
    this.error   = undefined;

    this.locationService.getCurrentAddress().subscribe({
      next: addr => {
        this.address = addr;
        this.loading = false;
      },
      error: err => {
        this.error   = `Erro: ${err}`;
        this.loading = false;
      },
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.deny();
    }
  }
}