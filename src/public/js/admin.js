document.addEventListener('DOMContentLoaded', () => {
    const citasContainer = document.getElementById('citas-container');
    const currentDateEl = document.getElementById('current-date');
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    let currentCitaId = null;

    // Mostrar fecha de hoy
    const dateSelector = document.getElementById('admin-date-selector');

    // Seteamos la fecha de hoy por defecto al selector
    const todayStr = new Date().toISOString().split('T')[0];
    dateSelector.value = todayStr;

    window.loadDashboard = async (fecha = null) => {
        try {
            const dateToLoad = fecha || dateSelector.value;
            const response = await fetch(`/api/admin/dashboard?fecha=${dateToLoad}`);
            const { agenda, fechaCargada } = await response.json();
            
            // Actualizar label de fecha
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateEl.textContent = new Date(fechaCargada + 'T00:00:00').toLocaleDateString('es-CR', options);
            
            citasContainer.innerHTML = '';
            
            if (agenda.length === 0) {
                citasContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 50px;">No hay eventos agendados para hoy.</p>';
                return;
            }

            agenda.forEach(item => {
                const div = document.createElement('div');
                div.className = `cita-card animate-fade-in ${item.tipo === 'bloqueo' ? 'es-bloqueo' : ''}`;
                
                if (item.tipo === 'cita') {
                    div.innerHTML = `
                        <div class="cita-time">${item.hora_inicio.substring(0, 5)}</div>
                        <div class="cita-details">
                            <h3>${item.cliente_nombre}</h3>
                            <p>${item.servicios}</p>
                        </div>
                        <div class="cita-status status-${item.estado}">${item.estado}</div>
                    `;
                    div.onclick = () => abrirDetalles(item);
                } else {
                    div.innerHTML = `
                        <div class="cita-time">${item.hora_inicio.substring(0, 5)}</div>
                        <div class="cita-details">
                            <h3>BLOQUEO: ${item.motivo || 'Sin motivo'}</h3>
                            <p>Hasta las ${item.hora_fin.substring(0, 5)}</p>
                        </div>
                        <span class="bloqueo-badge">CERRADO</span>
                    `;
                    div.onclick = () => { if(confirm('¿Eliminar este bloqueo?')) eliminarBloqueo(item.id); };
                }
                citasContainer.appendChild(div);
            });
        } catch (error) {
            console.error('Error:', error);
            citasContainer.innerHTML = '<p>Error al cargar la agenda.</p>';
        }
    };

    const abrirDetalles = (cita) => {
        currentCitaId = cita.id;
        modalBody.innerHTML = `
            <p><strong>Cliente:</strong> ${cita.cliente_nombre}</p>
            <p><strong>Teléfono:</strong> ${cita.cliente_telefono}</p>
            <p><strong>Servicios:</strong> ${cita.servicios}</p>
            <p><strong>Hora:</strong> ${cita.hora_inicio.substring(0, 5)} - ${cita.hora_fin.substring(0, 5)}</p>
            <p><strong>Total:</strong> ₡${parseFloat(cita.total).toLocaleString()}</p>
        `;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    };

    window.actualizarEstado = async (nuevoEstado) => {
        if (!currentCitaId) {
            cerrarModal();
            return;
        }
        
        try {
            const response = await fetch(`/api/admin/cita/${currentCitaId}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                loadDashboard();
            } else {
                console.error('Error al actualizar:', await response.text());
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            cerrarModal();
        }
    };

    window.cerrarModal = () => {
        console.log('Cerrando modal...');
        modal.classList.add('hidden');
        modal.style.display = 'none'; // Forzado
    };

    // --- NAVEGACIÓN ---
    window.showSection = (sectionName) => {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${sectionName}`).classList.add('active');

        // Nav desktop
        document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${sectionName}`);
        if(activeNav) activeNav.classList.add('active');

        // Nav mobile
        document.querySelectorAll('.mobile-nav a').forEach(a => a.classList.remove('active'));
        const activeMobileNav = document.getElementById(`m-nav-${sectionName}`);
        if(activeMobileNav) activeMobileNav.classList.add('active');

        if (sectionName === 'agenda') loadDashboard();
        if (sectionName === 'servicios') loadServicios();
        if (sectionName === 'bloqueos') loadBloqueos();
        if (sectionName === 'config') loadHorarios();
        if (sectionName === 'whatsapp') checkWhatsAppStatus();
    };

    // --- WHATSAPP BOT STATUS ---
    let waInterval = null;
    let qrGenerator = null;

    window.checkWhatsAppStatus = async () => {
        const badge = document.getElementById('wa-status-badge');
        const qrContainer = document.getElementById('qrcode-container');
        const readyMsg = document.getElementById('wa-ready-msg');
        const qrDiv = document.getElementById('qrcode');

        try {
            const res = await fetch('/api/admin/whatsapp-status');
            const { status, qr } = await res.json();

            badge.textContent = status.toUpperCase();
            
            if (status === 'qr' && qr) {
                qrContainer.style.display = 'block';
                readyMsg.style.display = 'none';
                
                qrDiv.innerHTML = '';
                new QRCode(qrDiv, {
                    text: qr,
                    width: 256,
                    height: 256
                });

                // Seguir verificando cada 5 segs
                if (!waInterval) waInterval = setInterval(checkWhatsAppStatus, 5000);
            } 
            else if (status === 'ready' || status === 'authenticated') {
                qrContainer.style.display = 'none';
                readyMsg.style.display = 'block';
                badge.style.background = 'rgba(0, 230, 118, 0.1)';
                badge.style.color = '#00e676';
                
                if (waInterval) {
                    clearInterval(waInterval);
                    waInterval = null;
                }
            }
            else {
                qrContainer.style.display = 'none';
                readyMsg.style.display = 'none';
                if (!waInterval) waInterval = setInterval(checkWhatsAppStatus, 3000);
            }
        } catch (error) {
            console.error('Error WA Status:', error);
        }
    };

    // --- BLOQUEOS ---
    const loadBloqueos = async () => {
        const list = document.getElementById('bloqueos-admin-list');
        list.innerHTML = '<p>Cargando bloqueos...</p>';
        try {
            const res = await fetch('/api/admin/bloqueos');
            const bloqueos = await res.json();
            list.innerHTML = '';
            if (bloqueos.length === 0) list.innerHTML = '<p>No hay bloqueos futuros.</p>';
            bloqueos.forEach(b => {
                const div = document.createElement('div');
                div.className = 'cita-card es-bloqueo';
                div.innerHTML = `
                    <div class="cita-time">${b.fecha.split('T')[0]}</div>
                    <div class="cita-details">
                        <h3>${b.motivo || 'Bloqueo'}</h3>
                        <p>${b.hora_inicio.substring(0, 5)} - ${b.hora_fin.substring(0, 5)}</p>
                    </div>
                    <button class="btn-danger" onclick="eliminarBloqueo(${b.id})">Eliminar</button>
                `;
                list.appendChild(div);
            });
        } catch (e) { list.innerHTML = 'Error'; }
    };

    window.abrirFormBloqueo = () => {
        modalBody.innerHTML = `
            <div class="form-group">
                <label>Fecha</label>
                <input type="date" id="block-date" required>
            </div>
            <div class="form-group">
                <label>Hora Inicio</label>
                <input type="time" id="block-start" required>
            </div>
            <div class="form-group">
                <label>Hora Fin</label>
                <input type="time" id="block-end" required>
            </div>
            <div class="form-group">
                <label>Motivo</label>
                <input type="text" id="block-reason" placeholder="Ej. Almuerzo, Reunión">
            </div>
            <button class="btn-primary" onclick="guardarBloqueo()">Crear Bloqueo</button>
        `;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    };

    window.guardarBloqueo = async () => {
        const data = {
            fecha: document.getElementById('block-date').value,
            hora_inicio: document.getElementById('block-start').value,
            hora_fin: document.getElementById('block-end').value,
            motivo: document.getElementById('block-reason').value
        };
        await fetch('/api/admin/bloqueo', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        cerrarModal();
        loadBloqueos();
    };

    window.eliminarBloqueo = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este bloqueo?')) return;
        await fetch(`/api/admin/bloqueo/${id}`, { method: 'DELETE' });
        loadBloqueos();
        loadDashboard();
    };

    // --- SERVICIOS ---
    const loadServicios = async () => {
        const list = document.getElementById('servicios-admin-list');
        list.innerHTML = '<p>Cargando servicios...</p>';
        try {
            const res = await fetch('/api/admin/servicios');
            const servicios = await res.json();
            list.innerHTML = '';
            servicios.forEach(s => {
                const div = document.createElement('div');
                div.className = 'item-card';
                div.innerHTML = `
                    <div class="form-group">
                        <label>Nombre</label>
                        <input type="text" value="${s.nombre}" id="name-${s.id}">
                    </div>
                    <div style="display:flex; gap:10px">
                        <div class="form-group">
                            <label>Precio (₡)</label>
                            <input type="number" value="${s.precio}" id="price-${s.id}" class="input-small">
                        </div>
                        <div class="form-group">
                            <label>Minutos</label>
                            <input type="number" value="${s.duracion}" id="dur-${s.id}" class="input-small">
                        </div>
                    </div>
                    <button class="btn-primary" onclick="guardarServicio(${s.id})">Guardar Cambios</button>
                `;
                list.appendChild(div);
            });
        } catch (e) { list.innerHTML = 'Error'; }
    };

    window.guardarServicio = async (id) => {
        const data = {
            nombre: document.getElementById(`name-${id}`).value,
            precio: document.getElementById(`price-${id}`).value,
            duracion: document.getElementById(`dur-${id}`).value,
            activo: 1
        };
        await fetch(`/api/admin/servicio/${id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        alert('Servicio actualizado');
        loadServicios();
    };

    // --- HORARIOS ---
    const loadHorarios = async () => {
        const list = document.getElementById('horarios-admin-list');
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        try {
            const res = await fetch('/api/admin/horarios');
            const horarios = await res.json();
            list.innerHTML = '';
            horarios.forEach(h => {
                const div = document.createElement('div');
                div.className = 'item-card';
                div.style.marginBottom = '10px';
                div.innerHTML = `
                    <div style="font-weight:bold; margin-bottom:10px">${dias[h.dia_semana]}</div>
                    <div class="form-inline">
                        <label>Jornada:</label>
                        <input type="time" value="${h.hora_apertura}" id="open-${h.id}">
                        <span>a</span>
                        <input type="time" value="${h.hora_cierre}" id="close-${h.id}">
                    </div>
                    <div class="form-inline" style="margin-top:10px">
                        <label>Almuerzo:</label>
                        <input type="time" value="${h.lunch_inicio || ''}" id="lunch-start-${h.id}">
                        <span>a</span>
                        <input type="time" value="${h.lunch_fin || ''}" id="lunch-end-${h.id}">
                    </div>
                    <div style="margin-top:15px">
                        <button class="btn-primary-small" onclick="guardarHorario(${h.id})">Guardar Día</button>
                    </div>
                `;
                list.appendChild(div);
            });
        } catch (e) { list.innerHTML = 'Error'; }
    };

    window.guardarHorario = async (id) => {
        const data = {
            hora_apertura: document.getElementById(`open-${id}`).value,
            hora_cierre: document.getElementById(`close-${id}`).value,
            lunch_inicio: document.getElementById(`lunch-start-${id}`).value,
            lunch_fin: document.getElementById(`lunch-end-${id}`).value,
            activo: 1
        };
        await fetch(`/api/admin/horario/${id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        alert('Horario actualizado');
    };

    loadDashboard();
});
