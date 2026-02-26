import { findBySucursalId } from "../../infra/repositories/inventario.repository";
import { productos, servicios } from "../../infra/storage/data";

export const obtenerInventarioPorSucursal = (sucursalId: string) => {

  const items = findBySucursalId(sucursalId);

  return items.map(item => {
    if (item.type === "product") {
      const producto = productos.find(p => p.id === item.itemId);
      return {
        tipo: "producto",
        nombre: producto?.nombre,
        cantidad: item.amount
      };
    }

    if (item.type === "service") {
      const servicio = servicios.find(s => s.id === item.itemId);
      return {
        tipo: "servicio",
        nombre: servicio?.nombre,
        cantidad: item.amount
      };
    }
  });
};