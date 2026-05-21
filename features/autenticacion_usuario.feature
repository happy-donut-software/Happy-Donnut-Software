# language: es
Característica: Autenticación de usuarios en el sistema
  Como usuario
  Quiero autenticarme en el sistema
  Para acceder a mis funcionalidades y datos personales de forma segura

  Escenario: Autenticación exitosa con credenciales válidas
    Dado que el usuario tiene cuenta registrada con email "cajero@donut.com"
    Y que la contraseña registrada es "segura123"
    Cuando el usuario proporciona email "cajero@donut.com"
    Y el usuario proporciona contraseña "segura123"
    Y el usuario solicita autenticación
    Entonces el sistema valida las credenciales
    Y el usuario recibe un token de sesión
    Y el usuario accede al sistema exitosamente

  Escenario: Autenticación falla con contraseña incorrecta
    Dado que el usuario tiene cuenta registrada con email "admin@donut.com"
    Y que la contraseña correcta es "miContraseña456"
    Cuando el usuario proporciona email "admin@donut.com"
    Y el usuario proporciona contraseña "contraseñaIncorrecta"
    Y el usuario solicita autenticación
    Entonces el sistema rechaza la autenticación
    Y el sistema muestra un mensaje de "Credenciales inválidas"
    Y el usuario no accede al sistema

  Escenario: Autenticación falla cuando usuario no existe
    Dado que el usuario proporciona email "noexiste@donut.com"
    Y que el usuario proporciona contraseña "password123"
    Cuando el usuario solicita autenticación
    Entonces el sistema rechaza la autenticación
    Y el sistema muestra un mensaje de "Usuario no encontrado"
    Y no se registra intento de acceso al usuario

  Escenario: Cerrar sesión invalida el token
    Dado que el usuario está autenticado con token válido
    Y que el usuario desea cerrar sesión
    Cuando el usuario solicita cerrar sesión
    Entonces el sistema invalida el token de sesión
    Y el usuario no puede realizar acciones posteriores
    Y el usuario es redirigido a la página de autenticación
