import React, { useState } from 'react';
import productsData from '../mocks/products.json';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetail } from '../components/catalog/ProductDetail';
import type { Products } from '../types/product';

export const CatalogPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
  const products = productsData as Products[];

  const handleSelectProduct = (product: Products) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="catalog-page" style={{ 
      padding: '40px 20px', 
      backgroundColor: '#f9f9f9', 
      minHeight: '100vh' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            color: '#1a1a1a', 
            margin: '0 0 8px 0' 
          }}>
            Catálogo de Productos y Servicios
          </h1>
          <p style={{ color: '#666', fontSize: '1rem' }}>
            Gestión de inventario y equipos para instalación en campo
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px' 
        }}>
          {products.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item} 
              onSelect={handleSelectProduct} 
            />
          ))}
        </div>

        {/* Modal de Detalle para RF-05 */}
        {selectedProduct && (
          <ProductDetail 
            product={selectedProduct} 
            onClose={handleCloseDetail} 
          />
        )}
      </div>
    </div>
  );
};