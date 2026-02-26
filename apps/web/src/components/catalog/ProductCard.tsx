import React from 'react';
import type { Products } from '../../types/product';

interface ProductCardProps {
  product: Products;
  onSelect: (product: Products) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const getCategoryColor = (category: string) => {
    if (category.includes('INTERNET') || category.includes('PLAN')) {
      return { bg: '#e3f2fd', text: '#0d47a1' };
    }
    return { bg: '#f5f5f5', text: '#424242' };
  };

  const colors = getCategoryColor(product.category);

  return (
    <div className="product-card" style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: colors.bg,
          color: colors.text,
          textTransform: 'uppercase'
        }}>
          {product.category.replace('_', ' ')}
        </span>
      </div>

      <h3 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '1.2rem', 
        color: '#212121',
        lineHeight: '1.4'
      }}>
        {product.name}
      </h3>

      <p style={{ 
        margin: '0 0 16px 0', 
        fontSize: '0.9rem', 
        color: '#757575',
        flexGrow: 1 
      }}>
        {product.description}
      </p>

      <div style={{ 
        borderTop: '1px solid #f0f0f0', 
        paddingTop: '12px',
        fontSize: '0.8rem',
        color: '#9e9e9e'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Identificador:</span>
          <span style={{ color: '#424242', fontWeight: '500' }}>{product.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Tipo de Inventario:</span>
          <span style={{ color: '#424242', fontWeight: '500' }}>
            {product.isSerialized ? 'Serializado (Control Individual)' : 'No Serializado (Granel)'}
          </span>
        </div>
      </div>

      <button 
        onClick={() => onSelect(product)}
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#0056b3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          width: '100%'
        }}
      >
        Ver Detalle de Equipo
      </button>
    </div>
  );
};