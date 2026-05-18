import { Component } from '@angular/core';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OnInit, OnDestroy } from '@angular/core';
import { MainSearchService } from '../services/main-search.service';
import { content, enterprise, filterRequest, filters, Service, UF } from '../interfaces/enterprise.model';
import { PaginationUtils } from '../../../_shared/utils/pagination-utils';
import { Address } from '../../../_shared/interface/address.model';
import { LocationService } from '../../../_shared/services/location/location.service';

@Component({
  selector: 'app-main-search',
  standalone: false,
  templateUrl: './main-search.component.html',
  styleUrl: './main-search.component.scss',
})
export class MainSearchComponent implements OnInit, OnDestroy {
  myControl = new FormControl();
  options = new Set<number>();
  //Subject para emitir um valor de "destruição" para cancelar assinaturas.
  private destroy$ = new Subject<void>();

  filtersState = {
    showPanel: false,
    showUfColumn: false,
    showServiceColumn: false,
    showCityColumn: false,
    showCityTable: false,
    showAddressTable: false,
    showAddressColumn: false,
  };

  private updateFiltersState(partial: Partial<typeof this.filtersState>): void {
     this.filtersState = { ...this.filtersState, ...partial };
  }


  filteredOptions: Observable<string[]>;
  enterprises: enterprise[] = [];
  enterprisesContent: enterprise[] = [];
  displayedColumns: string[] = ['service', 'enderecos', 'cidades', 'estados'];

  serviceFilters: filters[] = [];
  ufFilters: filters[] = [];
  ufFiltersBackup: filters[] = [];
  serviceFiltersBackup: filters[] = [];
  addressFiltersBackup: filters[] = [];
  cityFiltersBackup: filters[] = [];

  cityFilters: filters[] = [];  
  originalCityFilters: filters[] = [];
  originalAddressFilters: filters[] = [];

  dataBackup: filters[] = [];
  filterData: filters[] = [];

  clickedRows = new Set<filters>();
  address?: Address;
  loading = false;
  error?: string;

  constructor(
    private mainSearchService: MainSearchService,
    public paginationUtils: PaginationUtils,
    private locationService: LocationService
  ) {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  ngOnInit() {
    this.fillFilters();
    this.fillEnterprises();
  }
  // Limpa as assinaturas para evitar memory leaks
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.enterprises
      .filter(enterprise => enterprise.service.toLowerCase().includes(filterValue))
      .map(enterprise => enterprise.service);
  }

  /**
   * Verifica se uma linha está selecionada por comparação de valor,
   * evitando o problema de referência do Set.has().
   */
isRowSelected(row: filters): boolean {
  return [...this.clickedRows].some(
    r => this.isSameRow(r, row)
  );
}

  /**
   * Gerencia a seleção/deseleção de linhas e atualiza os filtros de cidade
   * com base nas UFs selecionadas.
   */
  selectedRow(row: filters) {
    this.verifyRowSelection(row);
    // Atualiza os filtros de cidade e endereço com base nas linhas clicadas
    this.fillUF(this.clickedRows);
    // Atualiza os filtros de endereço com base nas cidades selecionadas
    this.fillAddress(this.clickedRows);
    this.fillEnterprises();
  }

  // Gerencia a adição ou remoção de uma linha selecionada, comparando os valores para evitar problemas de referência.
  verifyRowSelection(row: filters) {
      if (this.isRowSelected(row)) {
      this.clickedRows = new Set(
        [...this.clickedRows].filter(
          r => !(this.isSameRow(r, row))
        )
      );
    } else {
      this.clickedRows.add(row);
    }
  }

  // Preenche as UFs selecionadas a partir das linhas clicadas, garantindo que apenas UFs únicas e não nulas sejam retornadas.
  fillUF(clickedRows: Set<filters>) {
    let selectedUfs = [...clickedRows]
      .map(r => r.uf)
      .filter(uf => uf != null);    
    this.updateCityFiltersWithUF(selectedUfs);

  }


  // Atualiza os filtros de cidade com base nas UFs selecionadas,
  //  garantindo que apenas cidades válidas sejam exibidas e mantendo os 
  // dados originais intactos para futuras seleções.
  updateCityFiltersWithUF(selectedUfs: string[]) {
     if (selectedUfs.length > 0) {
      this.updateFiltersState({ showCityTable: true });
      const validCities = this.dataBackup
        .filter(e => selectedUfs.includes(e.uf))
        .map(e => e.city);

      // Mantém city original intacto; adiciona cityLabel apenas para exibição
      this.cityFiltersBackup = this.originalCityFilters
        .filter(e => validCities.includes(e.city))
        .map(e => {
          const uf = this.dataBackup.find(d => d.city === e.city)?.uf;
          return {
            ...e,
            cityLabel: `${e.city} - ${uf}`
          };
        });

    } else {
      // Nenhuma UF selecionada: restaura tudo e fecha a coluna de cidades
      this.updateFiltersState({ showCityTable: false, 
                                showCityColumn: false });
      this.cityFiltersBackup = [...this.originalCityFilters];
    }
  }

  // Preenche os endereços selecionados a partir das linhas clicadas, garantindo que apenas endereços únicos e não nulos sejam retornados.
  fillAddress(clickedRows: Set<filters>) {
    let selectedCities = [...clickedRows]
      .map(r => r.city)
      .filter(city => city != null);

    this.updateAddressFiltersWithCity(selectedCities);

  }

  // Atualiza os filtros de endereço com base nas cidades selecionadas,
  // garantindo que apenas endereços válidos sejam exibidos e mantendo os 
  // dados originais intactos para futuras seleções.
  updateAddressFiltersWithCity(selectedCities: string[]) {
     if (selectedCities.length > 0) {
      this.updateFiltersState({ showAddressTable: true });
      const validAddress = this.dataBackup
        .filter(e => selectedCities.includes(e.city))
        .map(e => e.address);
      // Mantém address original intacto; adiciona addressLabel apenas para exibição
     this.addressFiltersBackup = this.originalAddressFilters
              .filter(e => validAddress.includes(e.address))
              .map(e => {
                const found = this.dataBackup.find(d => d.address === e.address); // busca tudo de uma vez
                return {
                  ...e,
                  addressLabel: `${e.address}, ${found?.number} - ${found?.city} - ${found?.uf}` // usa found para tudo
                };
              });
    } else {
      // Nenhuma UF selecionada: restaura tudo e fecha a coluna de cidades
      this.updateFiltersState({ showAddressTable: false, 
                                showAddressColumn: false });
      this.addressFiltersBackup = [...this.originalAddressFilters];
    }
  }

  toggleFilter() {
    this.updateFiltersState({ showPanel: !this.filtersState.showPanel });
  }

  fillFilters() {
    this.mainSearchService.getAllServices()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        this.dataBackup = data;

        const uf = data.map((item: any) => ({ uf: item.uf }));
        const service = data.map((item: any) => ({ service: item.service }));
        const city = data.map((item: any) => ({ city: item.city }));
        const address = data.map((item: any) => ({ address: item.address }));
        const number = data.map((item: any) => ({ number: item.number }));
        this.filterData = [...service, ...uf, ...city, ...address, ...number];

        this.serviceFiltersBackup = this.filterData
          .filter(e => e.service != null)
          .filter((e, i, arr) => arr.findIndex(x => x.service === e.service) === i);

        this.ufFiltersBackup = this.filterData
          .filter(e => e.uf != null)
          .filter((e, i, arr) => arr.findIndex(x => x.uf === e.uf) === i);

        this.cityFiltersBackup = this.filterData
          .filter(e => e.city != null)
          .filter((e, i, arr) => arr.findIndex(x => x.city === e.city) === i);

        this.addressFiltersBackup = this.filterData
          .filter(e => e.address != null)
          .filter((e, i, arr) => arr.findIndex(x => x.address === e.address) === i);


        this.originalAddressFilters = [...this.addressFiltersBackup];
        this.originalCityFilters = [...this.cityFiltersBackup];
      },
      error: (err) => {
        console.error('Erro ao buscar dados do servidor:', err);
      }
    });
  }

  fillEnterprises() {
    this.mainSearchService.getAllEnterprises(
      this.paginationUtils.pageIndex,
      this.paginationUtils.pageSize,
      this.clickedRows,
      this.myControl.value
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        this.enterprisesContent = data.content as enterprise[];
        this.paginationUtils.length = data.totalElements;
        this.paginationUtils.pageSize = data.size;
        this.paginationUtils.setPageSizeOptions(this.paginationUtils.length);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do servidor:', err);
      }
    });
  }

  handlePageEvent(event: any) {
    this.paginationUtils.pageIndex = event.pageIndex;
    this.paginationUtils.pageSize = event.pageSize;
    this.fillEnterprises();
  }

  getAddress() {
    this.loading = true;
    this.error = undefined;
    this.locationService.getCurrentAddress().subscribe({
      next: addr => {
        this.address = addr;
        this.loading = false;
      },
      error: err => {
        this.error = `Erro: ${err}`;
        this.loading = false;
      }
    });
  }

  onPermission(permitted: boolean) {
    if (permitted) {
      this.getAddress();
    } else {
      this.error = 'Permissão negada para acessar a localização.';
    }
  }

  toggleColumn(isUf: string) {
    if (isUf === 'uf') {
      this.updateFiltersState({ showUfColumn: !this.filtersState.showUfColumn });
      this.ufFilters = this.filtersState.showUfColumn ? this.ufFiltersBackup : [];
    } else if (isUf === 'city') {
      this.updateFiltersState({ showCityColumn: !this.filtersState.showCityColumn });
      // Não mexe no cityFiltersBackup para não perder os dados
    } else if (isUf === 'address'){
      console.log('toggle address');
      this.updateFiltersState({ showAddressColumn: !this.filtersState.showAddressColumn });
      // Não mexe no addressFiltersBackup para não perder os dados
    } else{
      this.updateFiltersState({ showServiceColumn: !this.filtersState.showServiceColumn });
      this.serviceFilters = this.filtersState.showServiceColumn ? this.serviceFiltersBackup : [];
    }
  }

  clearFilters() {
    this.clickedRows.clear();
    this.updateFiltersState({ showCityTable: false,
                              showAddressTable: false,
                              showCityColumn: false,
                              showAddressColumn: false,
                              showUfColumn: false,
                              showServiceColumn: false 
    });
    this.cityFiltersBackup = [...this.originalCityFilters];
    this.addressFiltersBackup = [...this.originalAddressFilters];
    this.ufFilters = this.filtersState.showUfColumn ? this.ufFiltersBackup : [];
    this.serviceFilters = this.filtersState.showServiceColumn ? this.serviceFiltersBackup : [];
    this.fillEnterprises();
  }

  // Compara duas linhas de filtros para determinar se são iguais, considerando os campos relevantes para a seleção.
  private isSameRow(row1: filters, row2: filters): boolean {
    return row1.city === row2.city 
      && row1.uf === row2.uf 
      && row1.service === row2.service 
      && row1.address === row2.address; 
  }

}