import React, { useEffect, useState } from "react";

export type TipoItem = "producto" | "servicio";

export interface ItemInventario {
  tipo: TipoItem;
  nombre: string | undefined;
  cantidad: number;
}

interface Props {
  sucursalId: string;
}

const Inventario: React.FC<Props> = ({ sucursalId }) => {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const res = await fetch(`http://localhost:3000/sucursales/${sucursalId}/inventario`);
        const data = await res.json();
        setInventario(data);
      } catch (e) {
        console.error("Error al obtener inventario:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInventario();
  }, [sucursalId]);

  if (loading) return <p className="text-gray-500">Cargando inventario...</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Inventario de sucursal {sucursalId}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-4 border-b">Tipo</th>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {inventario.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-4 border-b text-center capitalize">{item.tipo}</td>
                <td className="py-2 px-4 border-b text-center">{item.nombre}</td>
                <td className="py-2 px-4 border-b text-center">{item.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;