export type ProductCategory = 
  | 'INTERNET_RESIDENCIAL' 
  | 'INTERNET_EMPRESARIAL'
  | 'PLAN_MOVIL'
  | 'CELULAR'
  | 'TABLET'
  | 'LAPTOP'
  | 'ROUTER'
  | 'MODEM'
  | 'ONT'
  | 'DECODIFICADOR'
  | 'ANTENA'
  | 'CABLEADO'
  | 'SIM'
  | 'STB'      
  | 'CABLE'    

export interface Products {
  id: string;
  name: string;
  category: string; 
  description?: string;
  isSerialized: boolean; 
}


export interface Inventory {
  id: string;
  branchId: string;
  productId: string;
  qtyAvailable: number;
  qtyReserved: number;
}


export interface SeedData {
  products: Products[];
  inventory: Inventory[];
}