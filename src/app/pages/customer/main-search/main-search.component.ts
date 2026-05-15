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

  filteredOptions: Observable<string[]>;
  enterprises: any[] = [];
  enterprisesContent: any[] = [];
  displayedColumns: string[] = ['service', 'enderecos', 'cidades'];

  serviceFilters: filters[] = [];
  ufFilters: filters[] = [];
  ufFiltersBackup: filters[] = [];
  serviceFiltersBackup: filters[] = [];
  cityFiltersBackup: any[] = [];       // any[] para suportar cityLabel
  originalCityFilters: filters[] = [];
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
      r => r.city === row.city && r.uf === row.uf && r.service === row.service
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
          r => !(r.city === row.city && r.uf === row.uf && r.service === row.service)
        )
      );
    } else {
      this.clickedRows.add(row);
    }

    // Filtra cidades com base em TODAS as UFs selecionadas
    const selectedUfs = [...this.clickedRows]
      .map(r => r.uf)
      .filter(uf => uf != null);

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

        this.filterData = [...service, ...uf, ...city];

        this.serviceFiltersBackup = this.filterData
          .filter(e => e.service != null)
          .filter((e, i, arr) => arr.findIndex(x => x.service === e.service) === i);

        this.ufFiltersBackup = this.filterData
          .filter(e => e.uf != null)
          .filter((e, i, arr) => arr.findIndex(x => x.uf === e.uf) === i);

        this.cityFiltersBackup = this.filterData
          .filter(e => e.city != null)
          .filter((e, i, arr) => arr.findIndex(x => x.city === e.city) === i);

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
    } else {
      this.toggleColumnService = !this.toggleColumnService;
      this.serviceFilters = this.toggleColumnService ? this.serviceFiltersBackup : [];
    }
  }
}