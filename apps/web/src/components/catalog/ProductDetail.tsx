import React from "react";
import type { Product } from "../../types/product";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            border: 'none',
            background: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        <header style={{ marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#0056b3' }}>Detalle del Recurso</h2>
          <span style={{ fontSize: '0.8rem', color: '#666' }}>ID: {product.id}</span>
        </header>

        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: '#444' }}>Nombre del Producto/Servicio</label>
            <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>{product.name}</p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: '#444' }}>Categoría de Negocio</label>
            <p style={{ margin: '5px 0' }}>{product.category.replace('_', ' ')}</p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: '#444' }}>Descripción Técnica</label>
            <p style={{ margin: '5px 0', color: '#666', lineHeight: '1.5' }}>{product.description}</p>
          </div>

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Control de Trazabilidad</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Gestión de Inventario:</span>
              <span style={{ fontWeight: 'bold', color: product.isSerialized ? '#d32f2f' : '#2e7d32' }}>
                {product.isSerialized ? 'Serializado (Requiere SN)' : 'No Serializado (Stock Genérico)'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};