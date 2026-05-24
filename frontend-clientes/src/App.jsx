// src/App.jsx
import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartModal from './components/cart/CartModal';
import LoginModal from './components/auth/LoginModal';
import Home from './pages/Home';
import Products from './pages/Products';
import Promotions from './pages/Promotions';
import About from './pages/About';
import Contact from './pages/Contact';
import Comments from './pages/Comments';
import { loginUser, registerUser } from './services/authService';


export default function App() {

   const [isModalOpen, setIsModalOpen] = useState(false);
      // Estado para controlar si se muestra el formulario de Login (true) o Register (false)
   
      const [formError, setFormError] = useState(null); // Estado para mostrar errores al usuario
      const [isLoading, setIsLoading] = useState(false); // Estado para deshabilitar el botón
  
      const onClose = () => {
          setIsModalOpen(false);
          // Opcional: Limpiar el formulario al cerrar
          setLoginForm({ name: '', email: '', password: '', confirmPassword: '' });
          setFormError(null);
      };
  
      /**
       * Función que cambia la vista (Login/Register) y limpia los campos del formulario 
       * que no son comunes para evitar que se arrastre información de uno a otro.
       * @param {boolean} isLogin - True para mostrar Login, False para mostrar Register.
       */
      const handleToggleView = (isLogin) => {
          setShowLogin(isLogin);
          setFormError(null); // Limpiar errores al cambiar de vista
  
          // Mantenemos email y limpiamos los demás campos para evitar datos cruzados
          setLoginForm(prev => ({
              ...prev,
              // Limpiar campos específicos del formulario opuesto
              name: '',
              password: '', 
              confirmPassword: '' 
          }));
      };
  
  



  const [activeSection, setActiveSection] = useState('inicio');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showLogin, setShowLogin] = useState(true);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item =>
          item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, id: Date.now() }];
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const getTotalPrice = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);


 const handleLogin = async (e) => {
        e.preventDefault();
        setFormError(null); // Limpiar errores anteriores
        setIsLoading(true);

        console.log('hola');
        const { name, email, password, confirmPassword } = loginForm;
        let result;

        if (showLogin) {
            // Lógica de LOGIN
            result = await loginUser(email, password);
        } else {
            // Lógica de REGISTRO
            result = await registerUser(name, email, password, confirmPassword);
        }
        console.log('hola');
        setIsLoading(false);
        
        console.log(result);

        if (result.success) {
            // Manejo de Éxito
            console.log(`${showLogin ? 'Login' : 'Registro'} exitoso:`, result.data);
            
            // Aquí deberías guardar el token de sesión (si existe) y/o actualizar tu contexto de usuario global
            // ... (Lógica de autenticación exitosa) ...
            
            onClose(); // Cerrar el modal
        } else {
            // Manejo de Errores (de red o del servidor)
            const errorMsg = result.error.message || 'Ocurrió un error desconocido.';
            setFormError({ 
                message: errorMsg, 
                field: result.error.field // Útil para resaltar el campo si lo soporta el modal
            });
            console.error(`${showLogin ? 'Error de Login' : 'Error de Registro'}:`, result.error);
        }
    };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  const renderPage = () => {
    const props = { addToCart };
    switch (activeSection) {
      case 'inicio': return <Home {...props} />;
      case 'productos': return <Products {...props} />;
      case 'promociones': return <Promotions {...props} />;
      case 'nosotros': return <About />;
      case 'contacto': return <Contact />;
      case 'comentarios': return <Comments />;
      default: return <Home {...props} />;
    }
  };

  return (
    <div className="font-sans antialiased">
      <Header
        activeSection={activeSection}
        handleNavigation={handleNavigation}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        setIsLoginOpen={setIsLoginOpen}
      />
      <main>{renderPage()}</main>
      <Footer />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        handleLogin={handleLogin}
      />
    </div>
  );
}