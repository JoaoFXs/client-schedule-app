import { Component } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { MainSearchService } from '../services/main-search.service';
import { content, enterprise, filters } from '../interfaces/enterprise.model';
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
  filteredOptions: Observable<string[]>;
  enterprises: any[] = []; // Aqui você pode definir a estrutura do seu array de empresas
  enterprisesContent: any[] = [];
  ELEMENT_DATA: [] = [];
  displayedColumns: string[] = ['service'];
  filterData = this.ELEMENT_DATA;
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

  /**
   * A função _filter() é responsável por filtrar a lista de empresas com base no valor de entrada fornecido pelo usuário. Ela converte o valor de entrada para minúsculas e, em seguida, filtra a lista de empresas, retornando apenas aquelas cujo serviço inclui o valor de entrada (também convertido para minúsculas). O resultado é uma lista de empresas que correspondem ao critério de pesquisa do usuário.
   */
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.enterprises.filter(enterprise => enterprise.service.toLowerCase().includes(filterValue));
  }

  /**
   * A função selectedRow() é responsável por gerenciar a seleção de linhas na interface do usuário. Ela recebe um objeto do tipo 'filters' como parâmetro, que representa a linha selecionada. A função verifica se a linha já está presente no conjunto 'clickedRows'. Se estiver, ela remove a linha do conjunto; caso contrário, adiciona a linha ao conjunto. Isso permite que o usuário selecione ou desmarque linhas, e o estado das linhas selecionadas é mantido no conjunto 'clickedRows'.
   */
  selectedRow(row: filters) {
    console.log('Linha selecionada:', row);

    this.clickedRows.has(row) ? this.clickedRows.delete(row) : this.clickedRows.add(row);
 
    console.log('Linhas selecionadas:', this.clickedRows);
    this.fillEnterprises();
  }

  /**
   * A função toggleFilter() é responsável por alternar a visibilidade dos filtros na interface do usuário. Ela inverte o valor booleano da variável 'toggle', que pode ser usada para mostrar ou esconder os filtros no template HTML.
   */
  toggleFilter(){
    this.toggle = !this.toggle;
  }


  /**
   * Preenche a lista de filtros e empresas, além de configurar a paginação com base no total de empresas retornado pelo backend.
   * A função fillFilters() busca os serviços disponíveis e os armazena em ELEMENT_DATA, que é usado para exibir os filtros.
   */
  fillFilters(){
   this.mainSearchService.getAllServices().subscribe({
      next: (data: any) => {
        this.ELEMENT_DATA = data as []; 
        this.filterData = [...this.ELEMENT_DATA];
        console.log('Lista de filtros carregada:', this.ELEMENT_DATA);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do servidor:', err);
      }
    });
  }

  /**
   *  A função fillEnterprises() busca as empresas com base na página atual e tamanho da página, atualiza a lista de empresas exibidas e configura a paginação.
   */
  fillEnterprises(){
    console.log('Buscando empresas com os seguintes parâmetros: ');
    console.log('Índice da página:', this.paginationUtils.pageIndex);
    console.log('Tamanho da página:', this.paginationUtils.pageSize);
    console.log('Filtros selecionados:', this.clickedRows);
    console.log('Valor do campo de controle:', this.myControl.value);
    this.mainSearchService.getAllEnterprises(this.paginationUtils.pageIndex, this.paginationUtils.pageSize, this.clickedRows, this.myControl.value).subscribe({
      next: (data: any) => {
        this.enterprisesContent = data.content as enterprise[];
        this.paginationUtils.length = data.totalElements;
        this.paginationUtils.pageSize = data.size;
        this.paginationUtils.setPageSizeOptions(this.paginationUtils.length);
        console.log('Lista de empresas carregada:', this.enterprisesContent);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do servidor:', err);
      }
    });
  }

  /**
   * O método handlePageEvent() é chamado quando o usuário interage com a paginação, atualizando os parâmetros de página e recarregando as empresas.
   * @param event 
   */
  handlePageEvent(event: any) {
    this.paginationUtils.pageIndex = event.pageIndex;
    this.paginationUtils.pageSize = event.pageSize;

    // Chamamos o backend novamente com os novos parâmetros
    this.fillEnterprises();
  }
  
   getAddress() {
    this.loading = true;
    this.error = undefined;

    this.locationService.getCurrentAddress().subscribe({
      next: addr => {
        this.address = addr;
        console.log('Endereço obtido:', this.address);
        this.loading = false;
      },
      error: err => {
        this.error = `Erro: ${err}`;
        this.loading = false;
      }
    });
  }
}