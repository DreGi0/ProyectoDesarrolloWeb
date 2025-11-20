// calendario.js
import { inicializarCalendarioConEventos } from "./cargarEventosCalendario.js";

let eventos = {};
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

async function inicializar() {
    console.log('Iniciando calendario...');
    eventos = await inicializarCalendarioConEventos();
    console.log('Eventos obtenidos:', eventos);
    renderCalendar();
    setupEventListeners();
}

function renderCalendar() {
    const monthYear = document.getElementById('monthYear');
    const calendarGrid = document.getElementById('calendarGrid');

    if (!monthYear || !calendarGrid) {
        console.error('Elementos del calendario no encontrados');
        return;
    }

    // Nombres de los meses
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    monthYear.textContent = `${meses[currentMonth]} ${currentYear}`;

    // Limpiar el grid
    calendarGrid.innerHTML = '';

    // Primer día del mes (0 = Domingo, 1 = Lunes, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Último día del mes
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Días del mes anterior (vacíos)
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        calendarGrid.appendChild(emptyDiv);
    }

    // Días del mes actual
    for (let day = 1; day <= lastDate; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        
        // Formatear fecha como YYYY-MM-DD
        const fechaKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Verificar si hay eventos en este día
        if (eventos[fechaKey] && eventos[fechaKey].length > 0) {
            dayDiv.classList.add('has-event');
            
            // Crear indicador de eventos
            const eventIndicator = document.createElement('div');
            eventIndicator.classList.add('event-indicator');
            eventIndicator.textContent = eventos[fechaKey].length;
            
            dayDiv.innerHTML = `<span class="day-number">${day}</span>`;
            dayDiv.appendChild(eventIndicator);
            
            // Agregar evento click
            dayDiv.addEventListener('click', () => mostrarEventos(fechaKey, eventos[fechaKey]));
            dayDiv.style.cursor = 'pointer';
        } else {
            dayDiv.innerHTML = `<span class="day-number">${day}</span>`;
        }

        // Marcar el día actual
        const hoy = new Date();
        if (day === hoy.getDate() && currentMonth === hoy.getMonth() && currentYear === hoy.getFullYear()) {
            dayDiv.classList.add('today');
        }

        calendarGrid.appendChild(dayDiv);
    }

    console.log(`Calendario renderizado: ${meses[currentMonth]} ${currentYear}`);
}

function mostrarEventos(fecha, eventosDelDia) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalWhen = document.getElementById('modalWhen');
    const modalPlace = document.getElementById('modalPlace');
    const modalDesc = document.getElementById('modalDesc');

    if (!modal || !modalTitle || !modalWhen || !modalPlace || !modalDesc) {
        console.error('Elementos del modal no encontrados');
        return;
    }

    // Formatear fecha para mostrar
    const fechaObj = new Date(fecha + 'T00:00:00');
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (eventosDelDia.length === 1) {
        // Un solo evento
        const evento = eventosDelDia[0];
        modalTitle.textContent = evento.titulo;
        modalWhen.innerHTML = `<i class="fa-regular fa-calendar"></i> ${fechaFormateada} - ${evento.hora}`;
        modalPlace.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${evento.lugar}`;
        modalDesc.textContent = evento.descripcion;
    } else {
        // Múltiples eventos
        modalTitle.textContent = `Eventos del ${fechaFormateada}`;
        modalWhen.innerHTML = '';
        modalPlace.innerHTML = '';
        
        let eventosHTML = '<ul class="eventos-lista">';
        eventosDelDia.forEach(evento => {
            eventosHTML += `
                <li class="evento-item">
                    <strong>${evento.titulo}</strong><br>
                    <i class="fa-regular fa-clock"></i> ${evento.hora}<br>
                    <i class="fa-solid fa-location-dot"></i> ${evento.lugar}<br>
                    <small>${evento.descripcion}</small>
                </li>
            `;
        });
        eventosHTML += '</ul>';
        
        modalDesc.innerHTML = eventosHTML;
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function setupEventListeners() {
    // Botón mes anterior
    const prevBtn = document.getElementById('prevMonth');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });
    }

    // Botón mes siguiente
    const nextBtn = document.getElementById('nextMonth');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });
    }

    // Cerrar modal
    const modal = document.getElementById('eventModal');
    const closeBtn = document.getElementById('closeModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializar);