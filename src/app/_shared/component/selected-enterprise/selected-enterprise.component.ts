import { Component } from '@angular/core';

@Component({
  selector: 'app-selected-enterprise',
  templateUrl: './selected-enterprise.component.html',
  styleUrl: './selected-enterprise.component.scss',
  standalone: false
})
export class SelectedEnterpriseComponent {

 date: Date | null = null; // era Date[] provavelmente
  selectedTime: string | null = null;

  toggleInfoCondition = {
    toggleLocation: true,
    togglePhone: true,
    toggleHours: true,
    toggleEmail: true,
    toggleWebsite: true,
    toggleDuration: true,
  };

  toggleInfo(key: keyof typeof this.toggleInfoCondition) {
    this.toggleInfoCondition[key] = !this.toggleInfoCondition[key];
  }
getDateLabel(): string {
  if (!this.date) return 'Escolha a data';
  return this.date.toLocaleDateString('pt-BR');
}
}
 
