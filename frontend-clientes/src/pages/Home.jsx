// src/pages/Home.jsx
import React from 'react';
import Carousel from '../components/carousel/Carousel';
import Products from './Products';
import { promotions } from '../data/promotions';

export default function Home({ addToCart, onViewProducts }) {
  return (
    <>
      <Carousel />

      <section className="py-12 bg-orange-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mb-6">Bienvenidos a Happy Donut</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Desde 2020, endulzamos vidas con donas artesanales elaboradas con ingredientes frescos y mucho cariño.
          </p>
        </div>
      </section>

      <Products addToCart={addToCart} />

      <section className="py-12 bg-orange-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-orange-500 mb-12">¡Promociones Especiales!</h2>
          <p className="text-center text-lg text-gray-700 mb-12">
            Conoce nuestras ofertas y elige los productos disponibles del catálogo.
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
                    onClick={onViewProducts}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Ver productos disponibles
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-600 italic">
              * Las promociones se confirman según la disponibilidad del catálogo.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
