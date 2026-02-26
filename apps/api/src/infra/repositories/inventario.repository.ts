import { inventario} from "../storage/data"

export const findBySucursalId = (sucursalId: string) => {
  return inventario.filter(i => i.sucursalId === sucursalId);
};