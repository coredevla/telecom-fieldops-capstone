import React, { useState } from "react";
import Inventario from "./components/Inventario";

const App: React.FC = () => {
  const [sucursalId, setSucursalId] = useState("1");

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
          <option value="1">Centro</option>
          <option value="2">Norte</option>
        </select>
      </label>

      <Inventario sucursalId={sucursalId} />
    </div>
  );
};

export default App;








































//export default function App() {
//   return (
//     <main style={{ fontFamily: "sans-serif", padding: "1rem" }}>
//       <h1>Telecom FieldOps</h1>
//       <p>React + Vite funcionando.</p>
//     </main>
//   );
// }