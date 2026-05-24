// src/components/cart/CartItem.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function CartItem({ item, updateQuantity, removeFromCart }) {
  return (
    <div className="flex justify-between items-center mb-4 pb-4 border-b">
      <div className="flex items-center">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-12 h-12 object-cover rounded mr-3"
        />
        <div>
          <p className="font-medium text-gray-800">{item.name}</p>
          <p className="text-sm text-gray-600">S/. {item.price.toFixed(2)} x {item.quantity}</p>
        </div>
      </div>
      <div className="flex items-center">
        <button 
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
        >
          -
        </button>
        <span className="mx-2 w-8 text-center">{item.quantity}</span>
        <button 
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center"
        >
          +
        </button>
        <button 
          onClick={() => removeFromCart(item.id)}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}