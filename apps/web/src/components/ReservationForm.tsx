import { useState, type CSSProperties } from 'react';
import type { Product } from '../services/apiClient';

type Props = {
  products: Product[];
  loading: boolean;
  onReserve: (input: { workOrderId: string; productId: string; qty: number }) => Promise<void>;
  onRelease: (workOrderId: string) => Promise<void>;
};

export default function ReservationForm({ products, loading, onReserve, onRelease }: Props) {
  const [workOrderId, setWorkOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);

  const canSubmit = workOrderId.trim() && productId.trim() && qty > 0 && !loading;

  return (
    <section style={{ display: 'grid', gap: '0.75rem', maxWidth: 640 }}>
      <label style={labelStyle}>
        Work Order ID
        <input
          style={inputStyle}
          value={workOrderId}
          onChange={(event) => setWorkOrderId(event.target.value)}
          placeholder="wo_10001"
        />
      </label>

      <label style={labelStyle}>
        Producto
        <select
          style={inputStyle}
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
        >
          <option value="">Seleccionar producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Cantidad
        <input
          style={inputStyle}
          type="number"
          min={1}
          value={qty}
          onChange={(event) => setQty(Number(event.target.value))}
        />
      </label>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onReserve({ workOrderId: workOrderId.trim(), productId, qty })}
        >
          Reservar
        </button>
        <button
          type="button"
          disabled={!workOrderId.trim() || loading}
          onClick={() => onRelease(workOrderId.trim())}
        >
          Liberar reserva
        </button>
      </div>
    </section>
  );
}

const labelStyle: CSSProperties = {
  display: 'grid',
  gap: '0.35rem'
};

const inputStyle: CSSProperties = {
  padding: '0.45rem 0.55rem',
  border: '1px solid #ccc',
  borderRadius: 6
};
