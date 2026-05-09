import { Component, EventEmitter } from '@angular/core';
import { Output } from '@angular/core';

@Component({
  selector: 'app-permission-location',
  templateUrl: './permission-location.component.html',
  styleUrl: './permission-location.component.scss',
  standalone: false
})
export class PermissionLocationComponent {
  showPrompt: boolean = false;
  @Output() permitted = new EventEmitter<boolean>();


  open(){
    this.showPrompt = true;
  }

  allow() {
    this.showPrompt = false;
    this.permitted.emit(true);
  }

  deny() {
    this.showPrompt = false;
    this.permitted.emit(false);
  }

  //fecha ao clicar fora do card
  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
       this.deny();
    }
  }

}
