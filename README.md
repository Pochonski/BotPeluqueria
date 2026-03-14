# 💈 BarberPro - Sistema de Gestión & WhatsApp Bot

¡Bienvenido a **BarberPro**! El aliado perfecto para tu barbería. Este sistema combina un panel administrativo moderno con un **Bot de WhatsApp inteligente** para que tus clientes agenden citas solos, ¡mientras tú te enfocas en el corte!

## ✨ Características Principales

### 🤖 WhatsApp Bot Inteligente
- **Lenguaje Natural**: Entiende frases como "mañana", "lunes", o "el 16 de marzo".
- **Identificación Automática**: Saluda a los clientes conocidos por su nombre y registra a los nuevos.
- **Flujo Guiado**: Selección de servicios, fechas y horarios disponibles en tiempo real.
- **Confirmación Instantánea**: Resume la cita y el precio antes de guardar.

### ⚙️ Panel Administrativo (PWA Style)
- **Agenda Interactiva**: Visualiza citas y bloqueos por fecha con un selector dinámico.
- **Gestión de Servicios**: Cambia precios, nombres y duraciones al instante.
- **Control de Horarios**: Define tus horas de apertura, cierre y tiempos de almuerzo.
- **Bloqueos Puntuales**: ¿Un imprevisto? Bloquea rangos de tiempo específicos para que nadie agende ahí.
- **Diseño Móvil Primero**: Optimizado para usarse como una App desde tu teléfono.

## 🛠️ Tecnologías Usadas
- **Backend**: Node.js & Express
- **Base de Datos**: MySQL
- **Integración WA**: [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- **Frontend**: Vanilla JS, HTML5, CSS3 (Modern Glassmorphism Design)

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone [TU_URL_DE_GITHUB]
   cd BotPeluqueria
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz con lo siguiente:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=tu_contraseña
   DB_NAME=bot
   PORT=3000
   ```

4. **Base de Datos**:
   Importa el esquema de base de datos (puedes encontrarlo en `database.sql` si lo generaste o ejecutar los modelos).

5. **Iniciar el sistema**:
   ```bash
   npm start
   ```

6. **Vincular WhatsApp**:
   Escanea el código QR que aparecerá en la terminal con tu teléfono.

---

## 📱 Acceso en Línea (Producción)
- **📅 Agenda de Citas**: [botpeluqueria-joseph.up.railway.app](https://botpeluqueria-joseph.up.railway.app/)
- **🛡️ Panel Administrativo**: [botpeluqueria-joseph.up.railway.app/admin.html](https://botpeluqueria-joseph.up.railway.app/admin.html)

## 🤖 Cómo Conectar el Bot de WhatsApp
Para que el bot empiece a responder a tus clientes en el número de la barbería, sigue estos pasos:
1. Entra al **Panel Administrativo** desde tu celular o PC.
2. Ve a la sección **"📱 Bot"** en el menú lateral (o inferior en móviles).
3. Espera a que aparezca el **Código QR**.
4. Abre WhatsApp en tu celular -> **Dispositivos vinculados** -> **Vincular un dispositivo**.
5. Escanea el código QR de la pantalla.
6. ¡Listo! El estado cambiará a **READY** y el bot empezará a bretear.

---
## 📄 Licencia
Este proyecto es de uso privado para Barbería Premium.

---
*Desarrollado con ❤️ para BarberPro Costa Rica.*
