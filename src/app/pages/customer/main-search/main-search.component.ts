import { Component } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { MainSearchService } from '../services/main-search.service';
@Component({
  selector: 'app-main-search',
  standalone: false,
  templateUrl: './main-search.component.html',
  styleUrl: './main-search.component.scss',
})
export class MainSearchComponent implements OnInit {
  myControl = new FormControl('');

  filteredOptions: Observable<string[]>;
  enterprises: any[] = []; // Aqui você pode definir a estrutura do seu array de empresas
  
  
  
  constructor(
    private mainSearchService: MainSearchService
  ) {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  ngOnInit() {
    this.mainSearchService.getAllServices().subscribe(data => {
      this.enterprises = data; // Supondo que a resposta seja um array de empresas
      console.log('Empresas recebidas:', this.enterprises);
    });

  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.enterprises.filter(enterprise => enterprise.toLowerCase().includes(filterValue));
  }
}
