import React from 'react';
import { X, AlertCircle } from 'lucide-react'; // Importamos AlertCircle para los errores
import { MailIcon, LockIcon, UserIcon } from '../../utils/icons';
import Button from '../ui/Button';

// Hemos añadido formError y isLoading a las props
export default function LoginModal({ 
    isOpen, 
    onClose, 
    loginForm, 
    setLoginForm, 
    showLogin, 
    setShowLogin, // Ahora es handleToggleView en el padre
    handleLogin,
    formError, 
    isLoading 
}) {
    if (!isOpen) return null;

    // Función auxiliar para saber si el error actual es de un campo específico
    const getFieldError = (fieldName) => {
        return formError && formError.field === fieldName ? formError.message : null;
    };

    // Función auxiliar para saber si el error es global (no tiene un campo específico)
    const getGlobalError = () => {
        return formError && !formError.field ? formError.message : null;
    };

    // Función auxiliar para manejar el cambio de inputs
    const handleInputChange = (e) => {
        setLoginForm({...loginForm, [e.target.name]: e.target.value});
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-orange-500">Happy Donut</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Visualización de Error Global */}
                {getGlobalError() && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
                        <AlertCircle size={20} className="mr-2" />
                        <p>{getGlobalError()}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Sección de Login */}
                    {/* Ahora solo mostramos esta sección si showLogin es true */}
                    <div className={`bg-orange-50 p-6 rounded-lg ${!showLogin && 'hidden'}`}> 
                        <h3 className="text-xl font-bold text-orange-500 mb-4">Bienvenido de Nuevo</h3>
                        <p className="text-gray-600 mb-6">Inicia sesión para continuar</p>
                        
                        <form onSubmit={handleLogin}>
                            {/* Campo de Email (Login) */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Correo Electrónico</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email" // Añadimos el name
                                        value={loginForm.email}
                                        onChange={handleInputChange} // Usamos la función auxiliar
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pl-10 ${getFieldError('email') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
                                        placeholder="tu@email.com"
                                        required
                                        disabled={isLoading}
                                    />
                                    <MailIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                                {getFieldError('email') && <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>}
                            </div>
                            
                            {/* Campo de Contraseña (Login) */}
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Contraseña</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password" // Añadimos el name
                                        value={loginForm.password}
                                        onChange={handleInputChange} // Usamos la función auxiliar
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pl-10 ${getFieldError('password') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading}
                                    />
                                    <LockIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                                {getFieldError('password') && <p className="text-red-500 text-sm mt-1">{getFieldError('password')}</p>}
                            </div>
                            
                            <div className="flex items-center mb-6">
                                {/* Otros elementos del formulario */}
                            </div>
                            
                            {/* Botón de Submit (Login) */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                            </Button>
                            
                            <div className="mt-4 text-center">
                                {/* Botón para cambiar a Register */}
                                <p className="text-gray-600">
                                    ¿No tienes cuenta?{' '}
                                    <button 
                                        type="button"
                                        onClick={() => setShowLogin(false)} // Llama a handleToggleView(false)
                                        className="text-orange-500 hover:text-orange-600 font-medium"
                                        disabled={isLoading}
                                    >
                                        Regístrate aquí
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Sección de Registro */}
                    {/* Ahora solo mostramos esta sección si showLogin es false */}
                    <div className={`p-6 rounded-lg ${showLogin && 'hidden'} bg-gray-50`}> 
                        <h3 className="text-xl font-bold text-orange-500 mb-4">Crear Cuenta</h3>
                        <p className="text-gray-600 mb-6">Únete a la familia Happy Donut</p>
                        <form onSubmit={handleLogin}>
                            
                            {/* Campo de Nombre */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Nombre Completo</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name" // Añadimos el name
                                        value={loginForm.name}
                                        onChange={handleInputChange} // Usamos la función auxiliar
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pl-10 ${getFieldError('name') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
                                        placeholder="Juan Pérez"
                                        disabled={isLoading}
                                        required
                                    />
                                    <UserIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                                {getFieldError('name') && <p className="text-red-500 text-sm mt-1">{getFieldError('name')}</p>}
                            </div>
                            
                            {/* Campo de Email (Register) */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Correo Electrónico</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email" // Añadimos el name
                                        value={loginForm.email}
                                        onChange={handleInputChange} // Usamos la función auxiliar
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pl-10 ${getFieldError('email') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
                                        placeholder="tu@email.com"
                                        disabled={isLoading}
                                        required
                                    />
                                    <MailIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                                {getFieldError('email') && <p className="text-red-500 text-sm mt-1">{getFieldError('email')}</p>}
                            </div>
                            
                            {/* Campo de Contraseña (Register) */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Contraseña</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password" // Añadimos el name
                                        value={loginForm.password}
                                        onChange={handleInputChange} // Usamos la función auxiliar
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pl-10 ${getFieldError('password') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        required
                                    />
                                    <LockIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                                {getFieldError('password') && <p className="text-red-500 text-sm mt-1">{getFieldError('password')}</p>}
                            </div>
                            
                            {/* Campo de Confirmar Contraseña (Register) */}
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Confirmar Contraseña</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="confirmPassword" // Añadimos el name
                                        value={loginForm.confirmPassword}
                                        onChange={handleInputChange} // Usamos la función auxiliar
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pl-10 ${getFieldError('confirmPassword') ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        required
                                    />
                                    <LockIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                                {getFieldError('confirmPassword') && <p className="text-red-500 text-sm mt-1">{getFieldError('confirmPassword')}</p>}
                            </div>
                            
                            <div className="flex items-center mb-6">
                                <input type="checkbox" id="terms" className="mr-2" />
                                <label htmlFor="terms" className="text-gray-700">Acepto los términos y condiciones</label>
                            </div>
                            
                            {/* Botón de Submit (Register) */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                            </Button>
                            
                            <div className="mt-4 text-center">
                                {/* Botón para cambiar a Login */}
                                <p className="text-gray-600">
                                    ¿Ya tienes cuenta?{' '}
                                    <button 
                                        type="button"
                                        onClick={() => setShowLogin(true)} // Llama a handleToggleView(true)
                                        className="text-orange-500 hover:text-orange-600 font-medium"
                                        disabled={isLoading}
                                    >
                                        Inicia sesión
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}