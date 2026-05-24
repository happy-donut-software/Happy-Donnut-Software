// src/components/product/CategoryFilter.jsx
import React from 'react';
import { categories } from '../../data/categories';

export default function CategoryFilter({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-orange-500 text-white'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}