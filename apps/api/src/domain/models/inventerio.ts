

export type TipoItem ="product" |  "service" 

export interface Inventario {
    id: string;
    sucursalId: string;
    itemId: string;
    type: TipoItem;
    amount: number;
}