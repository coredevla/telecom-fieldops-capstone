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
  | 'SIM';

export interface Products {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  isSerialized: boolean; 
}