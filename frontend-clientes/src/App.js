// src/App.js

import React from 'react';

import Home from './pages/Home'; 



import './App.css'; 
console.log('Test ENV:', process.env.REACT_APP_GATEWAY_URL);

function App() {
  return (
    // <div className="App"> es el contenedor principal de toda tu aplicación.
    // Aquí es donde se podría manejar el ruteo (ej. react-router-dom) en el futuro, 
    // pero por ahora solo carga la página Home.
    <div className="App">
      <Home />
      
    </div>
  );
}

export default App;