import { Router } from "express";
import { obtenerInventarioPorSucursal } from "../../domain/services/inventario.service";

const router = Router();

router.get("/sucursales/:id/inventario", (req, res) => {
  const { id } = req.params;

  const data = obtenerInventarioPorSucursal(id);

  res.json(data);
});

export default router;