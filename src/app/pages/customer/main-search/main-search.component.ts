import { Component } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { OnInit } from '@angular/core';
import { MainSearchService } from '../services/main-search.service';
import { content, enterprise, filters } from '../interfaces/enterprise.model';
@Component({
  selector: 'app-main-search',
  standalone: false,
  templateUrl: './main-search.component.html',
  styleUrl: './main-search.component.scss',
})
export class MainSearchComponent implements OnInit {
  myControl = new FormControl('');
  pageSizeOptions: number[] = [];
  options = new Set<number>();
  pageIndex = 0;   // Página atual (começa em 0)
  pageSize = 6;   // Quantidade de itens por página (valor inicial)
  length = 0;     // Total de itens no banco
  toggle: boolean = false;
  filteredOptions: Observable<string[]>;
  enterprises: any[] = []; // Aqui você pode definir a estrutura do seu array de empresas

  enterprisesContent: any[] = [];

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
    this.fillEnterprises();
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

  fillEnterprises(){
    this.mainSearchService.getAllEnterprises(this.pageIndex, this.pageSize).subscribe({
      next: (data: any) => {
        this.enterprisesContent = data.content as enterprise[];
        this.length = data.totalElements;
        this.pageSize = data.size;
        this.setPageSizeOptions(this.length);
        console.log('Lista de empresas carregada:', this.enterprisesContent);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do servidor:', err);
      }
    });
  }
setPageSizeOptions(total: number) {
  // 1. Tratamento para lista vazia ou erro - Base agora é 6
  if (!total || total <= 0) {
    this.pageSizeOptions = [6, 12, 24];
    this.pageSize = 6;
    return;
  }

  const localOptions = new Set<number>();

  // 2. Opções base atualizadas para múltiplos de 6 ou valores padrão
  // Incluímos o 6 como a base mínima fixa.
  [6, 12, 24].forEach(opt => localOptions.add(opt));

  // 3. Garantir que o pageSize atual é válido e está na lista
  // Se o total caiu e o pageSize era um valor customizado (ex: Todos), 
  // ajustamos para o novo total, mas nunca abaixo de 6.
  if (this.pageSize > total && this.pageSize !== 6) {
    this.pageSize = total > 6 ? total : 6;
  }
  
  localOptions.add(this.pageSize);

  // 4. Adicionar múltiplos baseados no total (Apenas se total > 24)
  if (total > 24) {
    const percentages = [0.1, 0.25, 0.5];
    percentages.forEach(p => {
      // Arredonda para múltiplos de 6 para manter a consistência visual
      const calculated = Math.ceil((total * p) / 6) * 6;
      if (calculated > 6 && calculated < total) {
        localOptions.add(calculated);
      }
    });
  }

  // 5. Incluir o valor total (O "Todos")
  localOptions.add(total);

  // 6. Filtrar e Ordenar
  this.pageSizeOptions = Array.from(localOptions)
    .filter(opt => {
      // REGRA DE OURO: Mantemos a opção se:
      // - Ela for menor ou igual ao total
      // - OU se for a nossa base mínima (6), para nunca sumir do seletor
      return opt <= total || opt === 6;
    })
    .sort((a, b) => a - b);

  // 7. Forçar atualização de referência para o Angular detectar a mudança
  this.pageSizeOptions = [...this.pageSizeOptions];
}


  handlePageEvent(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    // Chamamos o backend novamente com os novos parâmetros
    this.fillEnterprises();
  }
  
}