# language: es
Característica: Autenticación de usuarios
  Como usuario del sistema Happy Donut
  Quiero registrarme e iniciar sesión
  Para acceder a las funciones según mi rol

  Escenario: Registrar un nuevo cajero
    Dado que proporciono nombre, email, password y rol válidos
    Cuando registro el usuario
    Entonces el usuario queda creado exitosamente

  Escenario: Iniciar sesión con credenciales válidas
    Dado que existe un usuario registrado
    Cuando inicio sesión con email y password correctos
    Entonces recibo un token de acceso Bearer