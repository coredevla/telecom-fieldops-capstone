"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBySucursalId = void 0;
const seed_data_json_1 = require("../../../../../scripts/seed-data.json");
// Devuelve los items de una sucursal
const findBySucursalId = (branchId) => {
    return seed_data_json_1.inventory.filter((item) => item.branchId === branchId);
};
exports.findBySucursalId = findBySucursalId;
