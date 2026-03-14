const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ServicioModel = require('../models/servicioModel');
const UsuarioModel = require('../models/usuarioModel');
const CitaModel = require('../models/citaModel');
const { calcularDisponibilidad } = require('../utils/appointmentUtils');

// Almacén de estados de conversación (en memoria)
const chatStates = new Map();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Escanea el código QR de WhatsApp para el bot');
});

client.on('ready', () => {
    console.log('✅ El Bot de WhatsApp está listo para bretear');
});

client.on('message', async (msg) => {
    const from = msg.from;
    const text = msg.body.trim().toLowerCase();
    
    // Solo responder a chats individuales (ignorar grupos y ESTADOS)
    if (from.includes('@g.us') || from === 'status@broadcast') return;

    let state = chatStates.get(from) || { step: 0 };

    try {
        // --- 0. BIENVENIDA / NOMBRE ---
        if (state.step === 0) {
            const usuario = await UsuarioModel.findByTelefono(from.replace('@c.us', ''));
            if (!usuario) {
                if (!state.esperandoNombre) {
                    state.esperandoNombre = true;
                    chatStates.set(from, state);
                    return await client.sendMessage(from, '¡Hola! 👋 Pura vida. Bienvenido a la Barbería.\n\n¿Cuál es tu nombre para poder agendarte?');
                } else {
                    state.nombre = msg.body.trim(); // Capturamos el nombre tal cual lo escribió
                    state.step = 1;
                    state.esperandoNombre = false;
                    chatStates.set(from, state);
                    return await sendServicesList(msg, true, state.nombre);
                }
            } else {
                state.nombre = usuario.nombre;
                state.usuarioId = usuario.id;
                state.step = 1;
                chatStates.set(from, state);
                return await sendServicesList(msg, false, state.nombre);
            }
        }

        // --- 1. SELECCIÓN DE SERVICIO ---
        if (state.step === 1) {
            const servicios = await ServicioModel.getAll();
            const index = parseInt(text) - 1;
            
            if (index >= 0 && index < servicios.length) {
                state.servicio = servicios[index];
                state.step = 2;
                chatStates.set(from, state);
                return await client.sendMessage(from, `Excelente, elegiste: *${state.servicio.nombre}*.\n\n¿Para qué día te gustaría la cita? 📅\n(Podés decirme "hoy", "mañana", "lunes", o una fecha específica)`);
            } else {
                return await client.sendMessage(from, 'Porfa, elegí un número de la lista.');
            }
        }

        // --- 2. SELECCIÓN DE FECHA ---
        if (state.step === 2) {
            const fecha = parseIntelligentDate(text);
            if (!fecha) {
                return await client.sendMessage(from, 'Mmm no te entendí bien la fecha. 😕\nEscribí algo como "hoy", "mañana", o el nombre del día.');
            }

            state.fecha = fecha;
            
            // Verificar si el día está cerrado antes de ver slots
            const dateObj = new Date(fecha);
            const diaSemana = dateObj.getUTCDay();
            const horario = await CitaModel.getHorariosNegocio(diaSemana);

            if (!horario) {
                return await client.sendMessage(from, `Híjole, el día ${fecha} (${text}) estamos *CERRADOS*. 🏠\nElegí otro día que te sirva.`);
            }

            const slots = await calcularDisponibilidad(fecha, [state.servicio.id]);

            if (slots.length === 0) {
                return await client.sendMessage(from, `Para el día ${fecha} ya no me quedan espacios disponibles. 🚫\n¿Querés intentar con otro día?`);
            }

            state.slots = slots;
            state.step = 3;
            chatStates.set(from, state);
            
            let response = `¡Genial! Estos son los campos libres para el *${fecha}*: ⏰\n\n`;
            slots.forEach((s, i) => response += `*${i + 1}.* ${s}\n`);
            response += '\nRespondé con el número del horario que más te sirva.';
            return await client.sendMessage(from, response);
        }

        // --- 3. SELECCIÓN DE HORA ---
        if (state.step === 3) {
            const index = parseInt(text) - 1;
            if (index >= 0 && index < state.slots.length) {
                state.hora = state.slots[index];
                
                // Confirmación final
                const resumen = `*RESUMEN DE TU CITA:* 💈\n\n` +
                                `👤 Nombre: ${state.nombre}\n` +
                                `✂️ Servicio: ${state.servicio.nombre}\n` +
                                `📅 Fecha: ${state.fecha}\n` +
                                `⏰ Hora: ${state.hora}\n` +
                                `💰 Total: ₡${state.servicio.precio}\n\n` +
                                `¿Está todo correcto? Respondé *SI* para confirmar o *NO* para empezar de nuevo.`;
                state.step = 4;
                chatStates.set(from, state);
                return await client.sendMessage(from, resumen);
            } else {
                return await client.sendMessage(from, 'Ese número no está en la lista de horarios. 😅 Porfa elegí uno válido.');
            }
        }

        // --- 4. CONFIRMACIÓN FINAL ---
        if (state.step === 4) {
            if (text.includes('si')) {
                // Si el usuario no existía, lo creamos ahora
                if (!state.usuarioId) {
                    state.usuarioId = await UsuarioModel.create(state.nombre, from.replace('@c.us', ''));
                }

                // Calcular hora fin
                const startDateTime = new Date(`${state.fecha}T${state.hora}`);
                const endDateTime = new Date(startDateTime.getTime() + state.servicio.duracion * 60000);
                const horaFin = endDateTime.toTimeString().substring(0, 5);

                console.log(`Guardando cita para ${state.nombre} el ${state.fecha} a las ${state.hora}`);
                await CitaModel.create(
                    state.usuarioId,
                    state.fecha,
                    state.hora,
                    horaFin,
                    state.servicio.precio,
                    [state.servicio.id]
                );
                console.log('Cita guardada con éxito');

                chatStates.delete(from); // Limpiar estado
                return await client.sendMessage(from, '¡LISTO! Tu cita quedó agendada con éxito. ✅ Te esperamos. ¡Pura vida!');
            } else {
                chatStates.delete(from);
                return await client.sendMessage(from, 'No hay problema, empezamos de cero. ¿Cuál es tu nombre?');
            }
        }

    } catch (error) {
        console.error('Error en Bot WhatsApp:', error);
        await client.sendMessage(from, 'Ocurrió un errorcito en el bot. 🙃 Probá más tarde porfa.');
    }
});

async function sendServicesList(msg, esNuevo = false, nombre = '') {
    const servicios = await ServicioModel.getAll();
    let saludo = esNuevo ? `¡Mucho gusto, *${nombre}*! ✨` : `¡Qué bueno saludarte de nuevo, *${nombre}*! ✨`;
    let response = `${saludo}\n\n¿Qué te gustaría hacerte hoy?\n\n`;
    servicios.forEach((s, i) => {
        response += `*${i + 1}.* ${s.nombre} (₡${s.precio})\n`;
    });
    response += `\n*Respondé con el número del servicio.*`;
    await client.sendMessage(msg.from, response);
}

// Lógica de "fechas inteligentes"
function parseIntelligentDate(text) {
    const now = new Date();
    
    if (text.includes('hoy')) return now.toISOString().split('T')[0];
    if (text.includes('mañana')) {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    const diasSemana = {
        'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
        'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6
    };

    for (let dia in diasSemana) {
        if (text.includes(dia)) {
            let targetDay = diasSemana[dia];
            let currentDay = now.getDay();
            let diff = targetDay - currentDay;
            if (diff <= 0) diff += 7; // Próxima semana
            
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + diff);
            return targetDate.toISOString().split('T')[0];
        }
    }

    // Si es formato YYYY-MM-DD o DD-MM
    const regex = /(\d{1,2})[-/](\d{1,2})/;
    const match = text.match(regex);
    if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = now.getFullYear();
        return `${year}-${month}-${day}`;
    }

    return null;
}

module.exports = client;
