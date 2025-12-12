// src/pages/Products.jsx
import React, { useState, useEffect, useCallback } from 'react';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductCard from '../components/product/ProductCard';
import { getAvailableProducts, searchProducts } from '../services/productsService';

export default function Products({ addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos desde el backend
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await getAvailableProducts();
      
      if (result.success) {
        // Transformar datos del backend al formato del frontend
        const transformedProducts = result.data.map(product => ({
          id: product.producto_id,
          name: product.nombre_producto,
          price: product.precio_base,
          category: product.tipo_producto === 'donut' ? 'donas' : 
                   product.tipo_producto === 'cafe' ? 'cafe' : 'otros',
          rating: 4.5, // valor por defecto
          description: product.descripcion || 'Delicioso producto de Happy Donuts',
          image: `https://placehold.co/300x200/ff9a8b/ffffff?text=${encodeURIComponent(product.nombre_producto)}`
        }));
        
        setProducts(transformedProducts);
        setError(null);
      } else {
        setError('Error al cargar productos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await searchProducts(searchTerm);
      
      if (result.success) {
        const transformedProducts = result.data.map(product => ({
          id: product.producto_id,
          name: product.nombre_producto,
          price: product.precio_base,
          category: product.tipo_producto === 'donut' ? 'donas' : 
                   product.tipo_producto === 'cafe' ? 'cafe' : 'otros',
          rating: 4.5,
          description: product.descripcion || 'Delicioso producto de Happy Donuts',
          image: `https://placehold.co/300x200/ff9a8b/ffffff?text=${encodeURIComponent(product.nombre_producto)}`
        }));
        
        setProducts(transformedProducts);
        setError(null);
      } else {
        setError('Error en la búsqueda');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Buscar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      loadProducts();
    }
  }, [searchTerm, handleSearch]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    return matchesCategory;
  });

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-500">Cargando productos...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={loadProducts}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-orange-500 mb-12">Nuestros Productos</h2>
        <CategoryFilter selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}