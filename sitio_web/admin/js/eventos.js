// Gestión de eventos del calendario (CRUD)

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"

const COLLECCION_EVENTOS = 'eventos';

// FUNCIÓN PARA CREAR NUEVO EVENTO
export async function crearEvento() {
    const titulo = document.getElementById('titulo').value.trim();
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value.trim();
    const lugar = document.getElementById('lugar').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const tipo = document.getElementById('tipo').value;
    
    if (!titulo || !fecha || !hora || !lugar || !descripcion || !tipo) {
        mostrarMensaje('Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    const fechaHora = new Date(`${fecha}T${hora}`);

    if (isNaN(fechaHora.getTime())) {
        mostrarMensaje('La fecha ingresada no es válida', 'error');
        return;
    }

    const nuevoEvento = {
        titulo: titulo,
        fecha: fecha, 
        hora: hora,
        fechaHora: Timestamp.fromDate(fechaHora),
        lugar: lugar,
        descripcion: descripcion,
        tipo: tipo,
        fechaCreacion: Timestamp.now()
    };

    mostrarMensaje('Guardando evento...', 'info');

    try {
        await addDoc(collection(db, COLLECCION_EVENTOS), nuevoEvento);
        mostrarMensaje('El evento ha sido creado exitosamente', 'success');
        
        setTimeout(() => {
            window.location.href = 'indexEventos.html';
        }, 1500)
    } catch (error) {
        console.error('Error al crear evento:', error);
        mostrarMensaje('Error al guardar: ' + error.message, 'error');
    }
}

// FUNCIÓN PARA LEER TODOS LOS EVENTOS
export async function cargarEventos() {
    const tbody = document.getElementById('listaEventos');
    const mensajeVacio = document.getElementById('mensajeVacio');

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando eventos...</p>
            </td>
        </tr>
    `;

    try {
        const q = query(
            collection(db, COLLECCION_EVENTOS),
            orderBy('fechaHora', 'asc')
        );

        const querySnapshot = await getDocs(q);
        tbody.innerHTML = '';

        if (querySnapshot.empty) {
            tbody.innerHTML = '';
            mensajeVacio.style.display = 'block';
            return;
        }

        mensajeVacio.style.display = 'none';

        querySnapshot.forEach((docSnapshot) => {
            const evento = docSnapshot.data();
            const id = docSnapshot.id;

            const titulo = evento.titulo || 'Sin título';
            const fecha = evento.fecha || 'Sin fecha';
            const hora = evento.hora || 'Sin hora';
            const lugar = evento.lugar || 'Sin lugar';
            const tipo = evento.tipo || 'general';

            const fechaObj = new Date(fecha);
            const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="fw-bold">${titulo}</td>
                <td>${fechaFormateada}</td>
                <td>${hora}</td>
                <td>${lugar}</td>
                <td>
                    <a href="editarEventos.html?id=${id}" class="btn btn-sm btn-primary me-1" title="Editar">
                        <i class="bi bi-pencil-square"></i> Editar
                    </a>
                    <button onclick="window.confirmarEliminar('${id}', '${titulo}')" class="btn btn-sm btn-danger" title="Eliminar">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;

            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar eventos:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error al cargar eventos: ${error.message}
                </td>
            </tr>
        `;
    }
}

// FUNCIÓN PARA LEER UN EVENTO EN ESPECÍFICO
export async function cargarDatosEvento(id) {
    const mensajeCarga = document.getElementById('mensajeCarga');
    const contenedorFormulario = document.getElementById('contenedorFormulario');

    try {
        // Obtener de firebase el evento por ID
        const docRef = doc(db, COLLECCION_EVENTOS, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const evento = docSnap.data();
            
            // Llenar el formulario con los datos (con valores por defecto si no existen)
            document.getElementById('eventoId').value = id;
            document.getElementById('titulo').value = evento.titulo || '';
            document.getElementById('fecha').value = evento.fecha || '';
            document.getElementById('hora').value = evento.hora || '';
            document.getElementById('lugar').value = evento.lugar || '';
            document.getElementById('descripcion').value = evento.descripcion || '';
            document.getElementById('tipo').value = evento.tipo || 'general';

            // Ocultar el mensaje de carga y mostrar formulario
            mensajeCarga.style.display = 'none';
            contenedorFormulario.style.display = 'block';
        } else {
            alert('Error: Evento no encontrado');
            window.location.href = 'indexEventos.html';
        }
    } catch (error) {
        console.error('Error al cargar evento:', error);
        alert('Error al cargar datos: ' + error.message);
        window.location.href = 'indexEventos.html';
    }
}

// FUNCIÓN PARA ACTUALIZAR UN EVENTO EXISTENTE
export async function actualizarEvento() {
    const id = document.getElementById('eventoId').value; // ✅ CORREGIDO: eventoId

    const titulo = document.getElementById('titulo').value.trim();
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value.trim();
    const lugar = document.getElementById('lugar').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const tipo = document.getElementById('tipo').value;

    if (!titulo || !fecha || !hora || !lugar || !descripcion || !tipo) {
        mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    const fechaHora = new Date(`${fecha}T${hora}`);

    if (isNaN(fechaHora.getTime())) {
        mostrarMensaje('La fecha o la hora ingresada no es válida', 'error');
        return;
    }

    const datosActualizados = {
        titulo: titulo,
        fecha: fecha,
        hora: hora,
        fechaHora: Timestamp.fromDate(fechaHora),
        lugar: lugar,
        descripcion: descripcion,
        tipo: tipo,
        fechaActualizacion: Timestamp.now()
    };

    mostrarMensaje('Actualizando eventos...', 'info');

    try {
        const docRef = doc(db, COLLECCION_EVENTOS, id); // ✅ CORREGIDO: db en lugar de DataView
        await updateDoc(docRef, datosActualizados);

        mostrarMensaje('El evento ha sido actualizado exitosamente', 'success');

        setTimeout(() => {
            window.location.href = 'indexEventos.html';
        }, 1500);
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        mostrarMensaje('Error al actualizar: ' + error.message, 'error');
    }
}

// FUNCIÓN PARA ELIMINAR UN EVENTO

// Variables globales para el modal de eliminación
let idEventoEliminar = null;
let modalEliminar = null;

export function confirmarEliminar(id, nombre) {
    idEventoEliminar = id;

    document.getElementById('nombreEliminar').textContent = nombre;

    if (!modalEliminar) {
        modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
    }
    modalEliminar.show();
}

async function eliminarEvento() {
    if (!idEventoEliminar) {
        return;
    }

    try {
        // Eliminar de firebase
        const docRef = doc(db, COLLECCION_EVENTOS, idEventoEliminar);
        await deleteDoc(docRef);

        cerrarModal();

        alert('Evento eliminado exitosamente');

        cargarEventos();

        idEventoEliminar = null;
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        alert('Error al eliminar: ' + error.message);
    }
}

// FUNCIONES AUXILIARES

function mostrarMensaje(texto, tipo) {
    const mensajeEstado = document.getElementById('mensajeEstado');
    
    if (!mensajeEstado) {
        return;
    }
    
    // Mapear los tipos a clases de Bootstrap
    const tiposBootstrap = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'info': 'alert-info',
        'warning': 'alert-warning'
    };
    
    const claseAlerta = tiposBootstrap[tipo] || 'alert-info';
    
    mensajeEstado.textContent = texto;
    mensajeEstado.className = 'alert ' + claseAlerta;
    mensajeEstado.style.display = 'block';
    
    // Ocultar automáticamente después de 5 segundos (excepto si es error)
    if (tipo !== 'error') {
        setTimeout(() => {
            mensajeEstado.style.display = 'none';
        }, 5000);
    }
}

function cerrarModal() {
    if (modalEliminar) {
        modalEliminar.hide();
    }
    idEventoEliminar = null;
}

// EVENT LISTENERS

document.addEventListener('DOMContentLoaded', function() {
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', eliminarEvento);
    }
});

// Exponer la función confirmarEliminar globalmente para los botones onclick
window.confirmarEliminar = confirmarEliminar;
