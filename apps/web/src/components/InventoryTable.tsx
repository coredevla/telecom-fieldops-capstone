import type { CSSProperties } from 'react';
import type { InventoryRow } from '../services/apiClient';

type Props = {
  rows: InventoryRow[];
};

export default function InventoryTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p>No hay inventario para la sucursal seleccionada.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
      <thead>
        <tr>
          <th style={cellHeader}>Producto</th>
          <th style={cellHeader}>Disponible</th>
          <th style={cellHeader}>Reservado</th>
          <th style={cellHeader}>Actualizado</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={cell}>{row.productName}</td>
            <td style={cell}>{row.qtyAvailable}</td>
            <td style={cell}>{row.qtyReserved}</td>
            <td style={cell}>{new Date(row.updatedAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const cellHeader: CSSProperties = {
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
  padding: '0.5rem'
};

const cell: CSSProperties = {
  borderBottom: '1px solid #eee',
  padding: '0.5rem'
};
