// src/services/authService.js
// La URL base del API Gateway debe estar en tu archivo .env del frontend (ej: REACT_APP_GATEWAY_URL=http://localhost:4000)
const GATEWAY_BASE_URL = process.env.REACT_APP_GATEWAY_URL;

// ----------------------------------------------------------------------
// Función Auxiliar para la validación simple de Email
// ----------------------------------------------------------------------
function isValidEmail(email) {
    // Regex simple para verificar formato: algo@algo.algo
    return /^\S+@\S+\.\S+$/.test(email);
}

// ----------------------------------------------------------------------
// Función Auxiliar para manejar la llamada genérica al API Gateway
// ----------------------------------------------------------------------
async function apiCall(endpoint, body) {
    if (!GATEWAY_BASE_URL) {
        throw new Error("La variable de entorno REACT_APP_GATEWAY_URL no está configurada. Verifica tu archivo .env.");
    }
    
    const url = `${GATEWAY_BASE_URL}/api/auth${endpoint}`; 
    
   // try {

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        
        });
        console.log(body);

        const data = await response.json(); 
        console.log(response);
        if (response.ok) {
            // Éxito (código 2xx)
            return { success: true, data: data };
        } else {
            // Error de autenticación/servidor (código 4xx, 5xx)
            return { success: false, error: data, status: response.status };
        }

    //} /*catch (error) {
        // Error de red
        //console.error('Error de red al intentar conectar con el Gateway:', error);
        //return { 
          //  success: false, 
            //error: { message: "Error de red: El servicio no está disponible." } 
        //};
   // }
}

// ----------------------------------------------------------------------
// 1. Lógica de Login
// ----------------------------------------------------------------------
export async function loginUser(email, password) {
    // **Validación local de Email**
    if (!isValidEmail(email)) {
        return { 
            success: false, 
            error: { 
                message: "El formato del correo electrónico no es válido.",
                field: "email" 
            } 
        };
    }
    // Usamos el email como username para el backend
    return apiCall('/login', { username: email, password });
}


// ----------------------------------------------------------------------
// 2. Lógica de Registro
// ----------------------------------------------------------------------
export async function registerUser(name, email, password, confirmPassword) {
    
    // **Validación local de Email**
    if (!isValidEmail(email)) {
        return { 
            success: false, 
            error: { 
                message: "El formato del correo electrónico no es válido.",
                field: "email" 
            } 
        };
    }
    
    // **Validación local de Contraseñas**
    if (password !== confirmPassword) {
        return { 
            success: false, 
            error: { 
                message: "Las contraseñas ingresadas no coinciden.",
                field: "confirmPassword" 
            } 
        };
    }

    // Usamos el email como username para el backend
    return apiCall('/register', { username: email, password });
}