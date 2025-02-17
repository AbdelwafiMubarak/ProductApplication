export interface Product {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    createdBy: string;


}


export class PageFilterDTO {
    NameAscending: boolean = true;
    NameDecending: boolean = false;
    PriceMin: number = 0;
    PriceMax: number = 0;
    PageNumber: number = 1;
    PageSize: number = 5;
    Name_search?: string = '';
}
