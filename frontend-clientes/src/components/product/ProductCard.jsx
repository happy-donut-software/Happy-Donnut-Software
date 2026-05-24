// src/components/product/ProductCard.jsx
import React from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import Button from '../ui/Button';
import { categories } from '../../data/categories';

const getCategoryName = (categoryId) => {
  const cat = categories.find(c => c.id === categoryId);
  return cat ? cat.name : '';
};

export default function ProductCard({ product, addToCart }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <button className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
            <Heart size={18} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="inline-block bg-orange-500 text-white text-xs px-2 py-1 rounded-full mb-2">
              {getCategoryName(product.category)}
            </span>
            <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
          </div>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-orange-500">S/. {product.price.toFixed(2)}</span>
          <Button variant="cart" onClick={() => addToCart(product)}>
            <ShoppingCart size={18} className="mr-1" /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}