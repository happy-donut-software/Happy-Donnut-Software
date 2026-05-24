/**
 * HappyDonuts - Punto de Entrada Principal
 * 
 * Este archivo inicializa la aplicación React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
