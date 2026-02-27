"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventario_service_1 = require("../../domain/services/inventario.service");
const router = (0, express_1.Router)();
// Endpoint para inventario de una sucursal específica
router.get("/sucursales/:id/inventario", (req, res) => {
    const { id } = req.params; // id = br_main, br_east, br_west
    const data = (0, inventario_service_1.obtenerInventarioPorSucursal)(id);
    res.json(data);
});
// Opcional: endpoint para ver todas las sucursales y su inventario
const seed_data_json_1 = require("../../../../../scripts/seed-data.json");
router.get("/sucursales/inventario", (req, res) => {
    const result = seed_data_json_1.branches.map((b) => ({
        sucursal: b.name,
        id: b.id,
        inventario: (0, inventario_service_1.obtenerInventarioPorSucursal)(b.id),
    }));
    res.json(result);
});
exports.default = router;
