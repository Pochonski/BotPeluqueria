document.addEventListener('DOMContentLoaded', () => {
    const servicesList = document.getElementById('services-list');
    const calendarSection = document.getElementById('calendar-section');
    const confirmSection = document.getElementById('confirm-section');
    const datePicker = document.getElementById('date-picker');
    const hoursGrid = document.getElementById('hours-grid');
    const bookingForm = document.getElementById('booking-form');

    // Estado de la reserva
    let bookingData = {
        services: [],
        date: '',
        hour: ''
    };

    // 1. Cargar servicios desde la API
    const loadServices = async () => {
        try {
            const response = await fetch('/api/servicios');
            const services = await response.json();

            servicesList.innerHTML = '';
            services.forEach(service => {
                const div = document.createElement('div');
                div.className = 'service-item';
                div.innerHTML = `
                    <div class="service-info">
                        <h3>${service.nombre}</h3>
                        <p>${service.duracion} min</p>
                    </div>
                    <div class="service-price">₡${parseFloat(service.precio).toLocaleString()}</div>
                `;
                div.onclick = () => selectService(service, div);
                servicesList.appendChild(div);
            });
        } catch (error) {
            console.error('Error cargando servicios:', error);
            servicesList.innerHTML = '<p>Error al cargar los servicios.</p>';
        }
    };

    // Configurar fechas permitidas (Semana actual)
    const setupDatePicker = () => {
        const today = new Date();
        const minDate = today.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD local
        
        // Permitir reservar hasta 15 días en el futuro
        const lastDay = new Date(today);
        lastDay.setDate(today.getDate() + 15);
        const maxDate = lastDay.toLocaleDateString('en-CA');
        
        datePicker.min = minDate;
        datePicker.max = maxDate;
        
        // Seteamos el valor inicial
        datePicker.value = minDate;
        bookingData.date = minDate;
    };

    const selectService = (service, element) => {
        document.querySelectorAll('.service-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        
        bookingData.services = [service.id];
        calendarSection.classList.remove('hidden');
        calendarSection.scrollIntoView({ behavior: 'smooth' });
        
        // Cargar horas para la fecha seleccionada por defecto
        if (bookingData.date) loadHours();
    };

    // 2. Al elegir fecha, cargar horas
    datePicker.addEventListener('change', (e) => {
        bookingData.date = e.target.value;
        loadHours();
    });

    const loadHours = async () => {
        hoursGrid.innerHTML = '<p style="grid-column: span 3; text-align: center;">Buscando huecos libres...</p>';
        
        try {
            const params = new URLSearchParams({
                fecha: bookingData.date,
                serviciosIds: bookingData.services.join(',')
            });
            const response = await fetch(`/api/citas/disponibilidad?${params}`);
            const hours = await response.json();
            
            hoursGrid.innerHTML = '';
            
            if (hours.length === 0) {
                hoursGrid.innerHTML = '<p style="grid-column: span 3; text-align: center; color: var(--text-secondary);">No hay espacios disponibles para este día.</p>';
                return;
            }

            hours.forEach(hour => {
                const div = document.createElement('div');
                div.className = 'hour-pill';
                div.textContent = hour;
                div.onclick = () => selectHour(hour, div);
                hoursGrid.appendChild(div);
            });
        } catch (error) {
            console.error('Error:', error);
            hoursGrid.innerHTML = '<p>Error al cargar disponibilidad.</p>';
        }
    };

    const selectHour = (hour, element) => {
        document.querySelectorAll('.hour-pill').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        
        bookingData.hour = hour;
        confirmSection.classList.remove('hidden');
        confirmSection.scrollIntoView({ behavior: 'smooth' });
    };

    // 3. Enviar Reserva
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        
        const nombre = document.getElementById('client-name').value;
        const telefono = document.getElementById('client-phone').value;

        try {
            btn.disabled = true;
            btn.textContent = 'Procesando...';

            const response = await fetch('/api/citas/reservar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    telefono,
                    fecha: bookingData.date,
                    horaInicio: bookingData.hour,
                    serviciosIds: bookingData.services
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert(`¡Éxito! Tu cita ha sido confirmada.`);
                window.location.reload();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al conectar con el servidor.');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    setupDatePicker();
    loadServices();
});
