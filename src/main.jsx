import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Home } from './pages/Home';
import './index.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="dark">
      <Home />
    </div>
  </StrictMode>
);
