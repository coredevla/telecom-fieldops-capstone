import fs from 'fs';
import path from 'path';

type InventoryRow = {
  id: string;
  branchId: string;
  productId: string;
  qtyAvailable: number;
  qtyReserved: number;
  updatedAt: string;
};

type ProductRow = {
  id: string;
  name: string;
  category: string;
  isSerialized: boolean;
};

type BranchRow = {
  id: string;
  name: string;
  isMain: boolean;
};

type SeedData = {
  products: ProductRow[];
  inventory: Array<{
    id: string;
    branchId: string;
    productId: string;
    qtyAvailable: number;
    qtyReserved: number;
  }>;
  branches: BranchRow[];
};

type ReservationItemInput = {
  productId: string;
  qty: number;
};

type ReserveRequest = {
  workOrderId: string;
  branchId: string;
  items: ReservationItemInput[];
};

type ReservationRecord = {
  workOrderId: string;
  branchId: string;
  items: ReservationItemInput[];
  reservedAt: string;
};

export class InventoryService {
  private readonly products: ProductRow[];
  private readonly branches: BranchRow[];
  private readonly inventory: InventoryRow[];
  private readonly reservations = new Map<string, ReservationRecord>();

  constructor() {
    const data = this.loadSeedData();
    const now = new Date().toISOString();
    this.products = data.products;
    this.branches = data.branches;
    this.inventory = data.inventory.map((item) => ({
      ...item,
      updatedAt: now
    }));
  }

  listBranches(): BranchRow[] {
    return this.branches;
  }

  listProducts(): ProductRow[] {
    return this.products;
  }

  listInventory(branchId: string): Array<InventoryRow & { productName: string }> {
    return this.inventory
      .filter((row) => row.branchId === branchId)
      .map((row) => {
        const product = this.products.find((p) => p.id === row.productId);
        return {
          ...row,
          productName: product?.name ?? row.productId
        };
      });
  }

  reserveForRequest(input: ReserveRequest): ReservationRecord {
    if (!input.workOrderId.trim()) {
      throw new Error('workOrderId is required');
    }
    if (!input.branchId.trim()) {
      throw new Error('branchId is required');
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new Error('At least one item is required');
    }
    if (this.reservations.has(input.workOrderId)) {
      throw new Error(`Work order ${input.workOrderId} already has a reservation`);
    }

    const missing: string[] = [];
    for (const item of input.items) {
      if (!item.productId || item.qty <= 0) {
        throw new Error('Each item must include productId and qty > 0');
      }
      const stock = this.inventory.find(
        (row) => row.branchId === input.branchId && row.productId === item.productId
      );
      if (!stock || stock.qtyAvailable < item.qty) {
        missing.push(item.productId);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Insufficient stock for products: ${missing.join(', ')} in branch ${input.branchId}`
      );
    }

    for (const item of input.items) {
      const stock = this.inventory.find(
        (row) => row.branchId === input.branchId && row.productId === item.productId
      );
      if (!stock) {
        continue;
      }
      stock.qtyAvailable -= item.qty;
      stock.qtyReserved += item.qty;
      stock.updatedAt = new Date().toISOString();
    }

    const reservation: ReservationRecord = {
      workOrderId: input.workOrderId,
      branchId: input.branchId,
      items: input.items,
      reservedAt: new Date().toISOString()
    };
    this.reservations.set(input.workOrderId, reservation);
    return reservation;
  }

  releaseForRequest(workOrderId: string): ReservationRecord {
    const reservation = this.reservations.get(workOrderId);
    if (!reservation) {
      throw new Error(`Reservation for ${workOrderId} was not found`);
    }

    for (const item of reservation.items) {
      const stock = this.inventory.find(
        (row) => row.branchId === reservation.branchId && row.productId === item.productId
      );
      if (!stock) {
        continue;
      }
      stock.qtyAvailable += item.qty;
      stock.qtyReserved -= item.qty;
      stock.updatedAt = new Date().toISOString();
    }

    this.reservations.delete(workOrderId);
    return reservation;
  }

  private loadSeedData(): SeedData {
    const seedPath = path.resolve(__dirname, '../../../../../scripts/seed-data.json');
    const raw = fs.readFileSync(seedPath, 'utf-8');
    return JSON.parse(raw) as SeedData;
  }
}

export const inventoryService = new InventoryService();
