import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CatalogPage } from './pages/CatalogPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/catalog" element={<CatalogPage />} />
        
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        
        <Route path="*" element={<div style={{ padding: '20px' }}>404 - Página no encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;