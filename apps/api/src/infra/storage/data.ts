import { Inventario } from "../../domain/models/inventerio"

export const sucursales = [
  { id: "1", nombre: "Santo Domingo" },
  { id: "2", nombre: "Santiago" },
  { id: "3", nombre: "Salcedo" },
  { id: "4", nombre: "Juan Dolio"},
  { }
];

export const productos = [
  { id: "p1", nombre: "Samsung A15", precio: 200 },
  { id: "p2", nombre: "Router TP-Link", precio: 80 }
];

export const servicios = [
  { id: "s1", nombre: "Plan 20GB", precio: 15 },
  { id: "s2", nombre: "Fibra 300MB", precio: 30 }
];

export const inventario: Inventario[] = [
  { id: "i1", sucursalId: "1", itemId: "p1", tipo: "producto", cantidad: 10 },
  { id: "i2", sucursalId: "1", itemId: "s1", tipo: "servicio", cantidad: 999 },
  { id: "i3", sucursalId: "2", itemId: "p2", tipo: "producto", cantidad: 5 }
];