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
    uf: string;
    address: string;
    number: string;
}

export interface filterRequest{
    service: [];
    uf: [];
}

export interface UF{
    name: string;
}

export interface Service{
    name: string;
}


export interface enterprise{
    name: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    service: string;
    address: string;
    number: string;
    neighborhood: string;
    state: string;
    city: string;
    UF: string;
    cep: string;
    filePublicUrl: string;
}
