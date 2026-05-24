// src/components/layout/Header.jsx
import React from 'react';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import Button from '../ui/Button';

export default function Header({
  activeSection,
  handleNavigation,
  isMenuOpen,
  setIsMenuOpen,
  cartItems,
  setIsCartOpen,
  setIsLoginOpen
}) {
  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'productos', label: 'Productos' },
    { id: 'promociones', label: 'Promociones' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' },
    { id: 'comentarios', label: 'Comentarios'},
  ];

  return (
    <header className="bg-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-orange-500 font-bold text-xl">☕</span>
          </div>
          <h1 className="text-2xl font-bold">Happy Donut</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`hover:text-orange-200 transition-colors ${
                activeSection === item.id ? 'text-orange-200' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-orange-400 rounded-full transition-colors"
          >
            <ShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-white text-orange-500 p-2 rounded-full hover:bg-orange-100 transition-colors"
          >
            <User size={24} />
          </button>
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-orange-400 py-4 px-4">
          <nav className="flex flex-col space-y-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`text-left hover:text-orange-200 transition-colors ${
                  activeSection === item.id ? 'text-orange-200' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}