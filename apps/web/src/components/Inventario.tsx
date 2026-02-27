import React, { useEffect, useState } from "react";

export interface ItemInventario {
  tipo: "producto";
  nombre: string;
  categoria: string;
  cantidadDisponible: number;
  cantidadReservada: number;
}

interface Props {
  sucursalId: string;
}

const Inventario: React.FC<Props> = ({ sucursalId }) => {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventario = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3000/sucursales/${sucursalId}/inventario`);
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setInventario(data);
      } catch (e: any) {
        console.error("Error al obtener inventario:", e);
        setError(e.message || "Error de red");
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, [sucursalId]);

  if (loading) return <p className="text-gray-500">Cargando inventario...</p>;
  if (error)
    return (
      <p className="text-red-500">Error cargando datos: {error}</p>
    );

  if (inventario.length === 0)
    return <p className="text-gray-700">No hay inventario para esta sucursal</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Inventario de sucursal {sucursalId}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-4 border-b">Tipo</th>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Categoría</th>
              <th className="py-2 px-4 border-b">Cantidad Disponible</th>
              <th className="py-2 px-4 border-b">Cantidad Reservada</th>
            </tr>
          </thead>
          <tbody>
            {inventario.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 px-4 border-b text-center capitalize">{item.tipo}</td>
                <td className="py-2 px-4 border-b text-center">{item.nombre}</td>
                <td className="py-2 px-4 border-b text-center">{item.categoria}</td>
                <td className="py-2 px-4 border-b text-center">{item.cantidadDisponible}</td>
                <td className="py-2 px-4 border-b text-center">{item.cantidadReservada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;