import React, { useState, useEffect } from "react";
import Inventario from "../components/Inventario";

export const InventarioPage: React.FC = () => {
  const [sucursalId, setSucursalId] = useState("br_main");
  const [allInventario, setAllInventario] = useState<
    { sucursal: string; id: string; inventario: any[] }[]
  >([]);

  // fetch all branch inventories when the page loads or when "all" is selected
  useEffect(() => {
    if (sucursalId === "all") {
      fetch("http://localhost:3000/sucursales/inventario")
        .then((res) => res.json())
        .then((data) => setAllInventario(data))
        .catch((e) => console.error("Error al obtener inventario global:", e));
    }
  }, [sucursalId]);

  return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">RF-06 - Inventario por sucursal</h1>

      <label className="block mb-4">
        Seleccionar sucursal:{" "}
        <select
          value={sucursalId}
          onChange={(e) => setSucursalId(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="br_main">Sucursal Principal</option>
          <option value="br_east">Sucursal Este</option>
          <option value="br_west">Sucursal Oeste</option>
          <option value="all">Todas las sucursales</option>
        </select>
      </label>

      {sucursalId === "all" ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Inventario total</h2>
          {allInventario.length === 0 ? (
            <p className="text-gray-500">Cargando inventario...</p>
          ) : (
            allInventario.map((branch, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="font-bold">{branch.sucursal}</h3>
                <table className="min-w-full border border-gray-200 bg-white mb-4">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="py-2 px-4 border-b">Producto ID</th>
                      <th className="py-2 px-4 border-b">Cantidad Disponible</th>
                      <th className="py-2 px-4 border-b">Cantidad Reservada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branch.inventario.map((item: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-2 px-4 border-b text-center">{item.productId}</td>
                        <td className="py-2 px-4 border-b text-center">{item.qtyAvailable}</td>
                        <td className="py-2 px-4 border-b text-center">{item.qtyReserved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      ) : (
        <Inventario sucursalId={sucursalId} />
      )}
    </div>
  );
};