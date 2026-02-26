

export type TipoItem ="producto" |  "servicio" 

export interface Inventario {
    id: string;
    sucursalId: string;
    itemId: string;
    tipo: TipoItem;
    cantidad: number;
}