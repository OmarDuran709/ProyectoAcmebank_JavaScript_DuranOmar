# Proyecto AcmeBank - Plataforma de Autogestión Bancaria

## Descripción

**AcmeBank** es una aplicación web desarrollada en JavaScript puro que permite a los usuarios la autogestión de sus cuentas bancarias. La plataforma ofrece funcionalidades completas para la administración de cuentas, transacciones, pagos, extractos y recuperación de acceso, todo con una interfaz moderna, responsiva y accesible.

---

## Funcionalidades Principales

### 1. **Inicio de Sesión**
- Formulario para ingresar tipo de identificación, número de identificación y contraseña.
- Validación segura de credenciales (contraseñas almacenadas como hash SHA-256).
- Mensajes claros de error en caso de credenciales incorrectas.
- Enlaces para crear cuenta y recuperar contraseña.

### 2. **Registro de Usuario**
- Formulario con validación en tiempo real de todos los campos requeridos:
  - Tipo y número de identificación, nombres, apellidos, género, teléfono, correo, dirección, ciudad y contraseña.
- Asignación automática de número de cuenta y fecha de creación.
- Resumen visual de la cuenta creada.
- Botón para cancelar y volver al inicio de sesión.

### 3. **Recuperación de Contraseña**
- Formulario para validar identidad mediante tipo y número de identificación y correo electrónico.
- Mensajes de error específicos si los datos no coinciden.
- Permite asignar una nueva contraseña si la validación es exitosa.
- Botón para cancelar y volver al inicio de sesión.

### 4. **Dashboard (Panel Principal)**
- **Menú lateral** con acceso a todas las funcionalidades.
- **Resumen de cuenta**: número de cuenta, saldo actual y fecha de creación.
- **Resumen de transacciones**: muestra las últimas 10 transacciones, con opción de impresión.
- **Consignación electrónica**: formulario para consignar dinero, actualiza saldo y genera comprobante imprimible.
- **Retiro de dinero**: formulario para retirar dinero, actualiza saldo y genera comprobante imprimible.
- **Pago de servicios públicos**: permite seleccionar servicio, ingresar referencia y valor, actualiza saldo y genera comprobante.
- **Extracto bancario**: filtro por año y mes, muestra todas las transacciones del periodo seleccionado.
- **Certificado bancario**: genera un certificado imprimible de la cuenta activa.
- **Cerrar sesión** y **eliminar cuenta** (con confirmación por modal).

### 5. **Persistencia y Seguridad**
- Todos los datos se almacenan en `localStorage` en formato JSON.
- Contraseñas protegidas mediante hash SHA-256.
- Sincronización de datos y sesión entre pestañas abiertas.
- Expiración automática de sesión por inactividad.

### 6. **Diseño y Accesibilidad**
- Interfaz responsiva para desktop, tablet y móvil.
- Paleta de colores profesional y tipografía moderna.
- Mensajes de error y éxito claros y accesibles.
- Navegación por teclado y soporte para lectores de pantalla (etiquetas ARIA, roles, etc.).

---

## Instalación y Ejecución

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/OmarDuran709/ProyectoAcmebank_JavaScript_DuranOmar.git
   ```
2. **Abre la carpeta del proyecto en tu editor o IDE favorito.**
3. **Abre el archivo `login.html` en tu navegador.**
4. **¡Listo! Puedes comenzar a usar la plataforma.**

> No se requiere backend ni instalación de dependencias externas. Todo funciona en el navegador.

---

## Estructura de Carpetas

```
Banco JavaScript/
│
├── js/
│   ├── dashboard.js
│   ├── database-manager.js
│   ├── login.js
│   ├── register.js
│   └── recovery.js
│
├── styles/
│   └── styles.css
│
├── db/
│   └── db.json
│
├── login.html
├── register.html
├── recovery.html
├── dashboard.html
└── README.md
```

---

## Lista de Funcionalidades Completadas

- [x] Inicio de sesión seguro y validado
- [x] Registro de usuario con validación y resumen
- [x] Recuperación de contraseña con mensajes específicos
- [x] Dashboard con menú y todas las operaciones bancarias
- [x] Resumen e impresión de transacciones y extractos
- [x] Pago de servicios públicos
- [x] Certificado bancario imprimible
- [x] Cierre y eliminación de cuenta (con modal)
- [x] Persistencia en localStorage y sincronización entre pestañas
- [x] Expiración automática de sesión
- [x] Accesibilidad y diseño responsivo

---

## Créditos

Desarrollado por Omar Durán y Jorge pinzon para el proyecto final de JavaScript - Banco Acme.

---

## Licencia

Este proyecto es solo para fines educativos.
