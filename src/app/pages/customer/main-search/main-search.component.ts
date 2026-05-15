import { Component } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OnInit } from '@angular/core';
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
export class MainSearchComponent implements OnInit {
  myControl = new FormControl();
  options = new Set<number>();

  toggle: boolean = false;
  toggleColumnUf: boolean = false;
  toggleColumnService: boolean = false;
  toggleColumnCity: boolean = false;
  toggleCitys: boolean = false;
  toggleAddress: boolean = false;
  toggleColumnAddress: boolean = false;

  filteredOptions: Observable<string[]>;
  enterprises: any[] = [];
  enterprisesContent: any[] = [];
  displayedColumns: string[] = ['service', 'enderecos', 'cidades', 'estados'];

  serviceFilters: filters[] = [];
  ufFilters: filters[] = [];
  ufFiltersBackup: filters[] = [];
  serviceFiltersBackup: filters[] = [];
  addressFiltersBackup: filters[] = [];
  cityFiltersBackup: any[] = [];       // any[] para suportar cityLabel
  originalCityFilters: filters[] = [];
  originalAddressFilters: filters[] = [];

  dataBackup: filters[] = [];
  filterData: any[] = [];

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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.enterprises.filter(enterprise => enterprise.service.toLowerCase().includes(filterValue));
  }

  /**
   * Verifica se uma linha está selecionada por comparação de valor,
   * evitando o problema de referência do Set.has().
   */
isRowSelected(row: filters): boolean {
  return [...this.clickedRows].some(
    r => r.city === row.city 
      && r.uf === row.uf 
      && r.service === row.service 
      && r.address === row.address  // <-- ADICIONAR
  );
}

  /**
   * Gerencia a seleção/deseleção de linhas e atualiza os filtros de cidade
   * com base nas UFs selecionadas.
   */
  selectedRow(row: filters) {
    // Toggle por comparação de valor
    const exists = this.isRowSelected(row);

    if (exists) {
      this.clickedRows = new Set(
        [...this.clickedRows].filter(
          r => !(r.city === row.city && r.uf === row.uf && r.service === row.service && r.address === row.address)
        )
      );
    } else {
      this.clickedRows.add(row);
    }

    // Filtra cidades com base em TODAS as UFs selecionadas
    const selectedUfs = [...this.clickedRows]
      .map(r => r.uf)
      .filter(uf => uf != null);

    const selectedCitys = [...this.clickedRows]
      .map(r => r.city)
      .filter(city => city != null);

    if (selectedUfs.length > 0) {
      this.toggleCitys = true;

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
      this.toggleCitys = false;
      this.toggleColumnCity = false;
      this.cityFiltersBackup = [...this.originalCityFilters];
    }


    if (selectedCitys.length > 0) {
      this.toggleAddress = true;

      const validAddress = this.dataBackup
        .filter(e => selectedCitys.includes(e.city))
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
      this.toggleAddress = false;
      this.toggleColumnAddress = false;
      this.addressFiltersBackup = [...this.originalAddressFilters];
    }

    this.fillEnterprises();
  }

  toggleFilter() {
    this.toggle = !this.toggle;
  }

  fillFilters() {
    this.mainSearchService.getAllServices().subscribe({
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
    ).subscribe({
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
      this.toggleColumnUf = !this.toggleColumnUf;
      this.ufFilters = this.toggleColumnUf ? this.ufFiltersBackup : [];
    } else if (isUf === 'city') {
      this.toggleColumnCity = !this.toggleColumnCity;
      // Não mexe no cityFiltersBackup para não perder os dados
    } else if (isUf === 'address'){
      console.log('toggle address');
      this.toggleColumnAddress = !this.toggleColumnAddress;
      // Não mexe no addressFiltersBackup para não perder os dados
    } else{
      this.toggleColumnService = !this.toggleColumnService;
      this.serviceFilters = this.toggleColumnService ? this.serviceFiltersBackup : [];
    }
  }
}