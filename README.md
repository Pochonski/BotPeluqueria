# 💈 BarberPro: Sistema de Gestión Inteligente & WhatsApp Bot

BarberPro es una solución integral diseñada para modernizar barberías y peluquerías. Combina la potencia de un **Bot de WhatsApp con Lenguaje Natural** y un **Dashboard Administrativo de alto rendimiento**, permitiendo automatizar el 90% de las tareas de agendado.

---

## 🌟 Características Destacadas

### 🤖 WhatsApp Bot (IA de Agendado)
- **Comprensión Semántica**: Entiende frases naturales como *"¿Qué tenés para mañana?"*, *"Agendame un corte para el lunes"*, o *"Ocupo cita hoy"*.
- **Memoria de Clientes**: Reconoce a los clientes recurrentes por su nombre, brindando un trato personalizado.
- **Validación en Tiempo Real**: Verifica automáticamente la disponibilidad basándose en servicios, horarios de almuerzo y bloqueos de agenda.
- **Cierre de Cita**: Genera resúmenes automáticos con el total a pagar y confirma la reserva directamente en la base de datos.
- **Filtrado Inteligente**: Ignora mensajes de grupos y estados de WhatsApp para evitar respuestas accidentales.

### 🛡️ Panel Administrativo (PWA Style)
- **Agenda Dinámica**: Vista completa de la jornada con diferenciación visual entre citas y bloqueos temporales.
- **Estructura "Mobile-First"**: Diseñado para funcionar como una App nativa en el celular del barbero, con navegación inferior fija.
- **Gestor de Servicios**: Control total sobre catálogo de servicios, precios y tiempos de ejecución.
- **Configuración de Horarios**: Define apertura, cierre y horarios de descanso por cada día de la semana.
- **Monitor de WhatsApp**: Sección dedicada para vincular la sesión mediante QR y monitorear el estado del bot (Ready, QR, etc.) sin usar la terminal.

---

## 🚀 Acceso Rápido

### 🌍 Enlaces de Producción
- **📅 Agenda para Clientes**: [https://botpeluqueria-joseph.up.railway.app/](https://botpeluqueria-joseph.up.railway.app/)
- **⚙️ Panel de Control**: [https://botpeluqueria-joseph.up.railway.app/admin.html](https://botpeluqueria-joseph.up.railway.app/admin.html)

---

## 🧪 Stack Tecnológico
- **Cloud Hosting**: [Railway.app](https://railway.app/)
- **Backend**: Node.js & Express.
- **Base de Datos**: PostgreSQL (Optimizado para Railway).
- **WhatsApp Engine**: [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) con Puppeteer Headless.
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Semántico y CSS3 Moderno (Glassmorphism & CSS Variables).

---

## 🛠️ Instalación y Configuración Local

1. **Clonar el Repo**:
   ```bash
   git clone https://github.com/TuUsuario/BotPeluqueria.git
   cd BotPeluqueria
   ```

2. **Variables de Entorno (.env)**:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   TZ=America/Costa_Rica
   ```

3. **Instalación de Dependencias**:
   ```bash
   npm install
   ```

4. **Inicialización de Base de Datos**:
   Ejecuta el script de configuración automática para crear las tablas en PostgreSQL:
   ```bash
   node setup_db.js
   ```

5. **Lanzar la App**:
   ```bash
   npm start
   ```

---

## 📱 Guía de Vinculación de WhatsApp
1. Accede al **Panel Administrativo** -> **Sección Bot**.
2. Cuando el estado indique `QR`, escanea el código con la opción "Vincular dispositivo" de WhatsApp.
3. El servidor guardará la sesión localmente (`.wwebjs_auth`) para evitar re-escaneos frecuentes.

---
## 📄 Licencia
Este proyecto es propiedad intelectual privada para uso exclusivo de **Barbería Joseph**. Prohibida su reproducción o distribución sin autorización.

---
*Desarrollado con pasión para elevar el estándar de las peluquerías en Costa Rica. ¡Pura vida!* 💈🇨🇷
