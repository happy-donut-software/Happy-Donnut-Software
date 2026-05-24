import React, { useState } from 'react';
// IMPORTANTE: Asegúrate de que la ruta sea correcta
import { loginUser, registerUser } from '../../services/authService'; 
import LoginModal from './LoginModal'; // Tu componente de UI

export default function AuthFormLogic() {
    // Estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Estado para controlar si se muestra el formulario de Login (true) o Register (false)
    const [showLogin, setShowLogin] = useState(true); 
    // Estado unificado para los datos del formulario
    const [loginForm, setLoginForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
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
    

    return (
        <>
            {/* Un botón o elemento para abrir el modal (ej. en el Navbar) */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
                Acceder / Registrarse
            </button>

            <LoginModal
                isOpen={isModalOpen}
                onClose={onClose}
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                showLogin={showLogin}
                // PASAMOS LA NUEVA FUNCIÓN DE TOGGLE Y LIMPIEZA:
                setShowLogin={handleToggleView} 
                handleLogin={handleLogin}
                formError={formError}
                isLoading={isLoading} 
            />
        </>
    );
}