import { Component } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { MainSearchService } from '../services/main-search.service';
import { content, filters } from '../interfaces/enterprise.model';
@Component({
  selector: 'app-main-search',
  standalone: false,
  templateUrl: './main-search.component.html',
  styleUrl: './main-search.component.scss',
})
export class MainSearchComponent implements OnInit {
  myControl = new FormControl('');

  toggle: boolean = false;
  filteredOptions: Observable<string[]>;
  enterprises: any[] = []; // Aqui você pode definir a estrutura do seu array de empresas
  
  ELEMENT_DATA: filters[] = []
  displayedColumns: string[] = ['service'];
  filterData = this.ELEMENT_DATA;
  clickedRows = new Set<filters>();
  
  constructor(
    private mainSearchService: MainSearchService
  ) {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  ngOnInit() {
    this.fillFilters();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.enterprises.filter(enterprise => enterprise.service.toLowerCase().includes(filterValue));
  }

  selectedRow(row: filters) {
    console.log('Linha selecionada:', row);

    this.clickedRows.has(row) ? this.clickedRows.delete(row) : this.clickedRows.add(row);
 
    console.log('Linhas selecionadas:', this.clickedRows);
  }

  toggleFilter(){
    this.toggle = !this.toggle;
  }

  fillFilters(){
   this.mainSearchService.getAllServices().subscribe({
      next: (data: any) => {
        this.ELEMENT_DATA = data.content as filters[]; 
        this.filterData = [...this.ELEMENT_DATA];
        console.log('Lista de filtros carregada:', this.ELEMENT_DATA);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do servidor:', err);
      }
    });
  }
}