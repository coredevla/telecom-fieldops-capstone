import { Router } from "express";
import { obtenerInventarioPorSucursal } from "../../domain/services/inventario.service";

const router = Router();

// Endpoint para inventario de una sucursal específica
router.get("/sucursales/:id/inventario", (req, res) => {
  const { id } = req.params; // id = br_main, br_east, br_west
  const data = obtenerInventarioPorSucursal(id);
  res.json(data);
});

// Opcional: endpoint para ver todas las sucursales y su inventario
import { branches } from "../../../../../scripts/seed-data.json";

router.get("/sucursales/inventario", (req, res) => {
  const result = (branches as { id: string; name: string }[]).map((b) => ({
    sucursal: b.name,
    id: b.id,
    inventario: obtenerInventarioPorSucursal(b.id),
  }));
  res.json(result);
});

export default router;