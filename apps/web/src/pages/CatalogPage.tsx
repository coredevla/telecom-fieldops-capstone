import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetail } from '../components/catalog/ProductDetail';
// Usamos los nombres alineados al contrato
import type { Product, InventoryItem } from '../types/product';

export const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        
        // El contrato separa productos e inventario en rutas distintas
        const [prodRes, invRes] = await Promise.all([
          fetch('http://localhost:3000/api/v1/catalog/products'),
          fetch('http://localhost:3000/api/v1/inventory?branchId=br_main') // Cambiado según contrato
        ]);

        const productsData = await prodRes.json();
        const inventoryData = await invRes.json();
        
        setProducts(productsData);
        setInventory(inventoryData);
      } catch (error) {
        console.error("Error cargando el catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  const filteredProducts = products.filter(p => filter === 'ALL' || p.category === filter);
  const categories = ['ALL', ...new Set(products.map(p => p.category))];

  return (
    <div className="catalog-page" style={{ padding: '40px 20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1>Catálogo de Equipos</h1>
          <div style={{ marginTop: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar por Categoría:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <div>Cargando equipos desde API v1...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredProducts.map((item) => (
              <ProductCard 
                key={item.id} 
                product={item} 
                onSelect={(p) => setSelectedProduct(p)} 
              />
            ))}
          </div>
        )}

        {selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </div>
    </div>
  );
};