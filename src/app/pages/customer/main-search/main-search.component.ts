import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';

import { MainSearchService } from '../services/main-search.service';
import { content, enterprise, filterRequest, filters, Service, UF } from '../interfaces/enterprise.model';
import { PaginationUtils } from '../../../_shared/utils/pagination-utils';
import { Address } from '../../../_shared/interface/address.model';
import { LocationService } from '../../../_shared/services/location/location.service';
import { ColumnType } from '../enum/column-type';
import { FiltersState } from '../interfaces/filter-state';

// ─── Componente ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-main-search',
  standalone: false,
  templateUrl: './main-search.component.html',
  styleUrl: './main-search.component.scss',
})
export class MainSearchComponent implements OnInit, OnDestroy {

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.fillFilters();
    this.fillEnterprises();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Construtor ─────────────────────────────────────────────────────────────

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

  // ── Estado: Formulário ─────────────────────────────────────────────────────

  myControl = new FormControl();
  filteredOptions: Observable<string[]>;

  // ── Estado: Dados ──────────────────────────────────────────────────────────

  options           = new Set<number>();
  enterprises       : enterprise[] = [];
  enterprisesContent: enterprise[] = [];
  displayedColumns  : string[]     = ['service', 'enderecos', 'cidades', 'estados'];

  dataBackup  : filters[] = [];
  filterData  : filters[] = [];
  clickedRows = new Set<filters>();

  // ── Estado: Filtros ────────────────────────────────────────────────────────

  serviceFilters      : filters[] = [];
  ufFilters           : filters[] = [];
  cityFilters         : filters[] = [];

  serviceFiltersBackup: filters[] = [];
  ufFiltersBackup     : filters[] = [];
  cityFiltersBackup   : filters[] = [];
  addressFiltersBackup: filters[] = [];

  originalCityFilters   : filters[] = [];
  originalAddressFilters: filters[] = [];

  // ── Estado: UI ────────────────────────────────────────────────────────────

  filtersState: FiltersState = {
    showPanel         : false,
    showUfColumn      : false,
    showServiceColumn : false,
    showCityColumn    : false,
    showCityTable     : false,
    showAddressTable  : false,
    showAddressColumn : false,
  };

  address?: Address;
  @Input() loading = false;
  error?  : string;

  // ── Utilitários privados ───────────────────────────────────────────────────

  /**
   * Atualiza o estado dos filtros de forma imutável,
   * garantindo detecção de mudanças correta pelo Angular.
   */
  private updateFiltersState(partial: Partial<FiltersState>): void {
    this.filtersState = { ...this.filtersState, ...partial };
  }

  /**
   * Compara duas linhas de filtros pelos campos que identificam unicidade.
   */
  private isSameRow(row1: filters, row2: filters): boolean {
    return row1.city    === row2.city
        && row1.uf      === row2.uf
        && row1.service === row2.service
        && row1.address === row2.address;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.enterprises
      .filter(e => e.service.toLowerCase().includes(filterValue))
      .map(e => e.service);
  }

  // ── Seleção de linhas ──────────────────────────────────────────────────────

  isRowSelected(row: filters): boolean {
    return [...this.clickedRows].some(r => this.isSameRow(r, row));
  }

  verifyRowSelection(row: filters): void {
    if (this.isRowSelected(row)) {
      this.clickedRows = new Set(
        [...this.clickedRows].filter(r => !this.isSameRow(r, row))
      );
    } else {
      this.clickedRows.add(row);
    }
  }

  selectedRow(row: filters): void {
    this.verifyRowSelection(row);
    this.fillUF(this.clickedRows);
    this.fillAddress(this.clickedRows);
    this.fillEnterprises();
  }

  // ── Filtros: UF → Cidade → Endereço ───────────────────────────────────────

  fillUF(clickedRows: Set<filters>): void {
    const selectedUfs = [...clickedRows]
      .map(r => r.uf)
      .filter(uf => uf != null);

    this.updateCityFiltersWithUF(selectedUfs);
  }

  updateCityFiltersWithUF(selectedUfs: string[]): void {
    if (selectedUfs.length > 0) {
      this.updateFiltersState({ showCityTable: true });

      const validCities = this.dataBackup
        .filter(e => selectedUfs.includes(e.uf))
        .map(e => e.city);

      this.cityFiltersBackup = this.originalCityFilters
        .filter(e => validCities.includes(e.city))
        .map(e => {
          const uf = this.dataBackup.find(d => d.city === e.city)?.uf;
          return { ...e, cityLabel: `${e.city} - ${uf}` };
        });

    } else {
      this.updateFiltersState({ showCityTable: false, showCityColumn: false });
      this.cityFiltersBackup = [...this.originalCityFilters];
    }
  }

  fillAddress(clickedRows: Set<filters>): void {
    const selectedCities = [...clickedRows]
      .map(r => r.city)
      .filter(city => city != null);

    this.updateAddressFiltersWithCity(selectedCities);
  }

  updateAddressFiltersWithCity(selectedCities: string[]): void {
    if (selectedCities.length > 0) {
      this.updateFiltersState({ showAddressTable: true });

      const validAddress = this.dataBackup
        .filter(e => selectedCities.includes(e.city))
        .map(e => e.address);

      this.addressFiltersBackup = this.originalAddressFilters
        .filter(e => validAddress.includes(e.address))
        .map(e => {
          const found = this.dataBackup.find(d => d.address === e.address);
          return {
            ...e,
            addressLabel: `${e.address}, ${found?.number} - ${found?.city} - ${found?.uf}`
          };
        });

    } else {
      this.updateFiltersState({ showAddressTable: false, showAddressColumn: false });
      this.addressFiltersBackup = [...this.originalAddressFilters];
    }
  }

  // ── Carga de dados ─────────────────────────────────────────────────────────

  fillFilters(): void {
    this.mainSearchService.getAllServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.dataBackup = data;

          const uf      = data.map((item: any) => ({ uf:      item.uf      }));
          const service = data.map((item: any) => ({ service: item.service  }));
          const city    = data.map((item: any) => ({ city:    item.city    }));
          const address = data.map((item: any) => ({ address: item.address  }));
          const number  = data.map((item: any) => ({ number:  item.number   }));

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
          this.originalCityFilters    = [...this.cityFiltersBackup];
        },
        error: (err) => console.error('Erro ao buscar dados do servidor:', err),
      });
  }

  fillEnterprises(): void {
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
        this.paginationUtils.length   = data.totalElements;
        this.paginationUtils.pageSize = data.size;
        this.paginationUtils.setPageSizeOptions(this.paginationUtils.length);
      },
      error: (err) => console.error('Erro ao buscar dados do servidor:', err),
    });
  }

  // ── Handlers de UI ────────────────────────────────────────────────────────

  handlePageEvent(event: any): void {
    this.paginationUtils.pageIndex = event.pageIndex;
    this.paginationUtils.pageSize  = event.pageSize;
    this.fillEnterprises();
  }

  toggleFilter(): void {
    this.updateFiltersState({ showPanel: !this.filtersState.showPanel });
  }

  toggleColumn(column: ColumnType): void {
    if (column === 'uf') {
      this.updateFiltersState({ showUfColumn: !this.filtersState.showUfColumn });
      this.ufFilters = this.filtersState.showUfColumn ? this.ufFiltersBackup : [];

    } else if (column === 'city') {
      this.updateFiltersState({ showCityColumn: !this.filtersState.showCityColumn });

    } else if (column === 'address') {
      this.updateFiltersState({ showAddressColumn: !this.filtersState.showAddressColumn });

    } else {
      this.updateFiltersState({ showServiceColumn: !this.filtersState.showServiceColumn });
      this.serviceFilters = this.filtersState.showServiceColumn ? this.serviceFiltersBackup : [];
    }
  }

  clearFilters(): void {
    this.clickedRows.clear();
    this.updateFiltersState({
      showCityTable     : false,
      showAddressTable  : false,
      showCityColumn    : false,
      showAddressColumn : false,
      showUfColumn      : false,
      showServiceColumn : false,
    });
    this.cityFiltersBackup    = [...this.originalCityFilters];
    this.addressFiltersBackup = [...this.originalAddressFilters];
    this.ufFilters      = this.filtersState.showUfColumn      ? this.ufFiltersBackup      : [];
    this.serviceFilters = this.filtersState.showServiceColumn ? this.serviceFiltersBackup : [];
    this.fillEnterprises();
  }
}