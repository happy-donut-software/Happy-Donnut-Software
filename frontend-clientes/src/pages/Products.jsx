import React, { useCallback, useEffect, useState } from 'react';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductCard from '../components/product/ProductCard';
import { getAvailableProducts, getCategories, searchProducts } from '../services/productsService';

const transformarProducto = (product) => ({
  id: product.id,
  name: product.nombre,
  price: Number(product.precio),
  category: product.categoria?.slug || 'sin-categoria',
  categoryName: product.categoria?.nombre || 'Sin categoría',
  rating: 4.5,
  description: product.descripcion || 'Producto fresco de Happy Donut',
  image: product.imagen_url || ('https://placehold.co/300x200/ff9a8b/ffffff?text=' + encodeURIComponent(product.nombre)),
});

export default function Products({ addToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (query = '') => {
    setLoading(true);
    const [productosResult, categoriasResult] = await Promise.all([
      query.trim() ? searchProducts(query) : getAvailableProducts(),
      getCategories(),
    ]);
    if (productosResult.success && categoriasResult.success) {
      setProducts((productosResult.data.productos || []).map(transformarProducto));
      setCategories(categoriasResult.data.categorias || []);
      setError(null);
    } else {
      setError('No se pudo cargar el catálogo. Comprueba que Kubernetes siga en ejecución.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void cargar(searchTerm); }, searchTerm ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [searchTerm, cargar]);

  const filteredProducts = products.filter((product) =>
    selectedCategory === 'todos' || product.category === selectedCategory);

  if (loading) return <section className="py-12 bg-white"><div className="container mx-auto px-4 text-center text-gray-500">Cargando productos...</div></section>;
  if (error) return <section className="py-12 bg-white"><div className="container mx-auto px-4 text-center"><div className="text-red-500 mb-4">{error}</div><button onClick={() => void cargar(searchTerm)} className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">Reintentar</button></div></section>;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-orange-500 mb-12">Nuestros Productos</h2>
        <CategoryFilter categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <div className="mb-8 flex justify-center">
          <input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} addToCart={addToCart} />)}
        </div>
        {filteredProducts.length === 0 && <p className="text-center text-gray-500">No hay productos en esta categoría.</p>}
      </div>
    </section>
  );
}
