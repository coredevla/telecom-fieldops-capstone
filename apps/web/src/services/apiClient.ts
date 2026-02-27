const API_BASE_URL = 'http://localhost:3000/api/v1';

export type Branch = {
  id: string;
  name: string;
  isMain: boolean;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  isSerialized: boolean;
};

export type InventoryRow = {
  id: string;
  branchId: string;
  productId: string;
  productName: string;
  qtyAvailable: number;
  qtyReserved: number;
  updatedAt: string;
};

export type ReservationItem = {
  productId: string;
  qty: number;
};

export type ReservationResponse = {
  workOrderId: string;
  branchId: string;
  items: ReservationItem[];
  reservedAt: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) {
        message = data.message;
      }
    } catch {
      // No-op when response has no JSON body.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  getBranches(): Promise<Branch[]> {
    return request<Branch[]>('/inventory/branches');
  },
  getProducts(): Promise<Product[]> {
    return request<Product[]>('/inventory/products');
  },
  getInventory(branchId: string): Promise<InventoryRow[]> {
    return request<InventoryRow[]>(`/inventory?branchId=${encodeURIComponent(branchId)}`);
  },
  reserveInventory(input: {
    workOrderId: string;
    branchId: string;
    items: ReservationItem[];
  }): Promise<ReservationResponse> {
    return request<ReservationResponse>('/inventory/reservations', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },
  releaseReservation(workOrderId: string): Promise<ReservationResponse> {
    return request<ReservationResponse>(`/inventory/reservations/${encodeURIComponent(workOrderId)}`, {
      method: 'DELETE'
    });
  }
};
