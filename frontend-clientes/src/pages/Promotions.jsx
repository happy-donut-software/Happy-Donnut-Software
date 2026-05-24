// src/pages/Promotions.jsx
import React from 'react';
import { promotions } from '../data/promotions';

export default function Promotions({ addToCart }) {
  return (
    <section className="py-12 bg-orange-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-orange-500 mb-12">Promociones Especiales!</h2>
        <p className="text-center text-lg text-gray-700 mb-12">
          Aprovecha nuestras increíbles ofertas y ahorra en tus productos favoritos
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img src={promo.image} alt={promo.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{promo.title}</h3>
                <p className="text-gray-600 mb-4">{promo.description}</p>
                <div className="flex items-center mb-4">
                  {promo.originalPrice && (
                    <span className="text-gray-400 line-through mr-2">S/. {promo.originalPrice.toFixed(2)}</span>
                  )}
                  <span className="text-orange-500 font-bold text-xl">S/. {promo.discountedPrice.toFixed(2)}</span>
                  {promo.savings && (
                    <span className="ml-2 text-green-600 font-medium">¡Ahorra S/. {promo.savings.toFixed(2)}!</span>
                  )}
                </div>
                <button 
                  onClick={() => addToCart({ name: promo.title, price: promo.discountedPrice })}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-gray-600 italic">
            * Nota: Las promociones están sujetas a disponibilidad.
          </p>
        </div>
      </div>
    </section>
  );
}