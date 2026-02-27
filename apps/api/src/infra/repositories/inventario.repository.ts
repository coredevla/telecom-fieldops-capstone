import { inventory } from "../../../../../scripts/seed-data.json";

export type InventoryItem = {
  id: string;
  branchId: string;
  productId: string;
  qtyAvailable: number;
  qtyReserved: number;
};

// Devuelve los items de una sucursal
export const findBySucursalId = (branchId: string): InventoryItem[] => {
  return (inventory as InventoryItem[]).filter(
    (item) => item.branchId === branchId
  );
};