export type TipoItem = "producto" | "servicio";

export interface ItemInventario {
  tipo: TipoItem;
  nombre: string | undefined;
  cantidad: number;
}