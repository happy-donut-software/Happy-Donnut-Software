# 🛠️ Configuración Inicial de Git

Para asegurarte de que tu computadora aplique automáticamente las reglas de ramas y commits de Happy Donut Software, ejecuta estos pasos de configuración por única vez.

---

## 1. Configurar tu identidad global
Asegúrate de que tus commits salgan con tu nombre y correo institucional, no con alias genéricos:
```bash
git config --global user.name "Tu Nombre y Apellido"
git config --global user.email "tu_correo@empresa.com"
```

---

## 2. Automatizar el borrado de ramas fantasmas
Configura Git para que limpie automáticamente de tu vista las ramas remotas que tus compañeros ya borraron en el servidor cada vez que hagas un `git fetch` o `git pull`:
```bash
git config --global fetch.prune true
```

---

## 3. Configurar el editor por defecto para los Mensajes de Commit
Si Git te abre una pantalla negra al hacer commits o fusiones, asegúrate de que use tu editor de preferencia (ejemplo: Visual Studio Code) para que no te quedes atrapado:
```bash
git config --global core.editor "code --wait"
```

---

## 🚨 Checklist antes de enviar un Pull Request (PR)
Antes de avisar al equipo que terminaste tu tarea, verifica:
1. [ ] ¿Hice `git merge develop` hoy por la mañana para traer los cambios de mis compañeros?
2. [ ] ¿Mi rama sigue la estructura `feature/módulo-acción-descripción` en minúsculas?
3. [ ] ¿Mis mensajes de commit empiezan con el tipo correcto (ej: `feat(inventario):`) y un verbo en infinitivo?
4. [ ] ¿Ejecuté las pruebas locales y el proyecto levanta correctamente?
