import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetail } from '../components/catalog/ProductDetail';
import type { Products, Inventory } from '../types/product';

export const CatalogPage: React.FC = () => {
  
  const [products, setProducts] = useState<Products[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');

  
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('http://localhost:3000/api/catalog');
        const data = await response.json();
        
        
        setProducts(data.products || []);
        setInventory(data.inventory || []);
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

  if (loading) return <div style={{ padding: '40px' }}>Cargando equipos...</div>;

  return (
    <div className="catalog-page" style={{ padding: '40px 20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1>Catálogo de Equipos y Servicios</h1>
          
          <div style={{ marginTop: '20px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filtrar:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredProducts.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item} 
              onSelect={(p) => setSelectedProduct(p)} 
            />
          ))}
        </div>

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