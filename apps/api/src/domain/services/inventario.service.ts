import { findBySucursalId } from "../../infra/repositories/inventario.repository";
import { products } from "../../../../../scripts/seed-data.json";

export type Product = {
  id: string;
  name: string;
  category: string;
  isSerialized: boolean;
};

export const obtenerInventarioPorSucursal = (sucursalId: string) => {
  const items = findBySucursalId(sucursalId);

  return items.map((item) => {
    const producto = (products as Product[]).find(p => p.id === item.productId);

    return {
      tipo: "producto",
      nombre: producto?.name ?? "Producto desconocido",
      categoria: producto?.category ?? "Sin categoría",
      cantidadDisponible: item.qtyAvailable,
      cantidadReservada: item.qtyReserved,
    };
  });
};