"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerInventarioPorSucursal = void 0;
const inventario_repository_1 = require("../../infra/repositories/inventario.repository");
const seed_data_json_1 = require("../../../../../scripts/seed-data.json");
const obtenerInventarioPorSucursal = (sucursalId) => {
    const items = (0, inventario_repository_1.findBySucursalId)(sucursalId);
    return items.map((item) => {
        const producto = seed_data_json_1.products.find(p => p.id === item.productId);
        return {
            tipo: "producto",
            nombre: producto?.name ?? "Producto desconocido",
            categoria: producto?.category ?? "Sin categoría",
            cantidadDisponible: item.qtyAvailable,
            cantidadReservada: item.qtyReserved,
        };
    });
};
exports.obtenerInventarioPorSucursal = obtenerInventarioPorSucursal;
