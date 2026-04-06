export interface Enterprise{
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    cep: number;    
}

export interface content{
    content: Enterprise[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export interface filters{
    state: string;
    service: string;
    city: string;
    cep: string;
    neighBorhood: string;
}

