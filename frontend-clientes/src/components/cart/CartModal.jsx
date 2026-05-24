// src/components/cart/CartModal.jsx
import React, { useState } from 'react';
import CartItem from './CartItem';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import { createOrder } from '../../services/ordersService';

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  updateQuantity, 
  removeFromCart, 
  getTotalPrice 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConfirmPurchase = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Preparar items para el backend
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      // Crear orden
      const result = await createOrder(orderItems, paymentMethod);

      if (result.success) {
        // Limpiar carrito y cerrar modal
        onClose();
        // Aquí podrías mostrar un mensaje de éxito o redirigir a página de confirmación
        alert('¡Orden creada exitosamente! ID: ' + result.data.order.venta_id);
        
        // Opcional: redirigir a página de órdenes
        // window.location.href = '/orders';
      } else {
        setError(result.error?.message || 'Error al crear la orden');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-500">Resumen de la Orden</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
            <Button onClick={onClose}>Seguir Comprando</Button>
          </div>
        ) : (
          <>
            <div className="mb-6 max-h-60 overflow-y-auto">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>Productos ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>S/. {getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>S/. {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
            <div className="mb-6">
              <p className="mb-2">Método de pago:</p>
              <div className="flex space-x-4">
                <Button 
                  variant={paymentMethod === 'yape' ? 'primary' : 'secondary'} 
                  className="flex-1"
                  onClick={() => setPaymentMethod('yape')}
                >
                  Yape
                </Button>
                <Button 
                  variant={paymentMethod === 'plin' ? 'primary' : 'secondary'} 
                  className="flex-1"
                  onClick={() => setPaymentMethod('plin')}
                >
                  Plin
                </Button>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleConfirmPurchase}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}