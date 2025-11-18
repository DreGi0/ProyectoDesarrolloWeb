// Gestión completa de los integrantes (CRUD)

// Importar Firebase desde el archivo firebase.js
import { db } from './firebase.js';

// Importar las funciones de Firestore
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
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Variables globales
const COLECCION_INTEGRANTES = 'integrantes';

// FUNCIÓN para crear nuevo integrante

export async function crearIntegrante() {
    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const rol = document.getElementById('rol').value.trim();
    const fotoUrl = document.getElementById('fotoUrl').value.trim();
    
    const biografiaParrafo1 = document.getElementById('biografiaParrafo1').value.trim();
    const biografiaParrafo2 = document.getElementById('biografiaParrafo2').value.trim();
    const biografiaParrafo3 = document.getElementById('biografiaParrafo3').value.trim();
    const biografiaParrafo4 = document.getElementById('biografiaParrafo4').value.trim();
    
    const logro1 = document.getElementById('logro1').value.trim();
    const logro2 = document.getElementById('logro2').value.trim();
    const logro3 = document.getElementById('logro3').value.trim();
    const logro4 = document.getElementById('logro4').value.trim();
    
    const estiloMusical = document.getElementById('estiloMusical').value.trim();

    // Validar que no hayan campos vacíos
    if (!nombre || !rol || !fotoUrl || !biografiaParrafo1 || !biografiaParrafo2 || 
        !biografiaParrafo3 || !biografiaParrafo4 || !logro1 || !logro2 || 
        !logro3 || !logro4 || !estiloMusical) {
        
        mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    // Crear un objeto con los datos del integrante
    const nuevoIntegrante = {
        nombre: nombre,
        rol: rol,
        fotoUrl: fotoUrl,
        biografiaParrafo1: biografiaParrafo1,
        biografiaParrafo2: biografiaParrafo2,
        biografiaParrafo3: biografiaParrafo3,
        biografiaParrafo4: biografiaParrafo4,
        logros: [logro1, logro2, logro3, logro4],
        estiloMusical: estiloMusical,
        fechaCreacion: Timestamp.now()
    };

    // Mostrar el mensaje de carga
    mostrarMensaje('Guardando integrante...', 'info');

    try {
        // Guardar en Firestore
        await addDoc(collection(db, COLECCION_INTEGRANTES), nuevoIntegrante);
        
        mostrarMensaje('El integrante ha sido creado exitosamente', 'success');
        
        // Redirigir a la lista después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'indexIntegrantes.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al crear integrante:', error);
        mostrarMensaje('Error al guardar: ' + error.message, 'error');
    }
}

// FUNCIÓN para leer todos los integrantes

export async function cargarIntegrantes() {
    const tbody = document.getElementById('listaIntegrantes');
    const mensajeVacio = document.getElementById('mensajeVacio');
    
    // Mostrar el mensaje de carga
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando integrantes...</p>
            </td>
        </tr>
    `;
    
    try {
        // Obtener de Firebase todos los integrantes ordenados por fecha
        const q = query(
            collection(db, COLECCION_INTEGRANTES),
            orderBy('fechaCreacion', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        // Limpiar la tabla
        tbody.innerHTML = '';
        
        // Verificar si hay integrantes
        if (querySnapshot.empty) {
            tbody.innerHTML = '';
            mensajeVacio.style.display = 'block';
            return;
        }
        
        mensajeVacio.style.display = 'none';
        
        // Recorrer cada integrante y crear una fila en la tabla
        querySnapshot.forEach((docSnapshot) => {
            const integrante = docSnapshot.data();
            const id = docSnapshot.id;
            
            // Valores por defecto si los campos no existen
            const nombre = integrante.nombre || 'Sin nombre';
            const rol = integrante.rol || 'Sin rol';
            const fotoUrl = integrante.fotoUrl || 'https://via.placeholder.com/80';
            
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>
                    <img src="${fotoUrl}" alt="${nombre}" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                </td>
                <td class="fw-bold">${nombre}</td>
                <td>${rol}</td>
                <td>
                    <a href="editarIntegrantes.html?id=${id}" class="btn btn-sm btn-primary me-1" title="Editar">
                        <i class="bi bi-pencil-square"></i> Editar
                    </a>
                    <button onclick="window.confirmarEliminar('${id}', '${nombre}')" class="btn btn-sm btn-danger" title="Eliminar">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
            
            tbody.appendChild(fila);
        });
        
    } catch (error) {
        console.error('Error al cargar integrantes:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error al cargar integrantes: ${error.message}
                </td>
            </tr>
        `;
    }
}

// FUNCIÓN para leer un integrante en específico

export async function cargarDatosIntegrante(id) {
    const mensajeCarga = document.getElementById('mensajeCarga');
    const contenedorFormulario = document.getElementById('contenedorFormulario');
    
    try {
        // Obtener de Firebase el integrante por ID
        const docRef = doc(db, COLECCION_INTEGRANTES, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const integrante = docSnap.data();
            
            // Llenar el formulario con los datos (con valores por defecto si no existen)
            document.getElementById('integranteId').value = id;
            document.getElementById('nombre').value = integrante.nombre || '';
            document.getElementById('rol').value = integrante.rol || '';
            document.getElementById('fotoUrl').value = integrante.fotoUrl || '';
            document.getElementById('vistaPrevia').src = integrante.fotoUrl || '';
            
            document.getElementById('biografiaParrafo1').value = integrante.biografiaParrafo1 || '';
            document.getElementById('biografiaParrafo2').value = integrante.biografiaParrafo2 || '';
            document.getElementById('biografiaParrafo3').value = integrante.biografiaParrafo3 || '';
            document.getElementById('biografiaParrafo4').value = integrante.biografiaParrafo4 || '';
            
            // Manejar los logros (por si no existen)
            const logros = integrante.logros || ['', '', '', ''];
            document.getElementById('logro1').value = logros[0] || '';
            document.getElementById('logro2').value = logros[1] || '';
            document.getElementById('logro3').value = logros[2] || '';
            document.getElementById('logro4').value = logros[3] || '';
            
            document.getElementById('estiloMusical').value = integrante.estiloMusical || '';
            
            // Ocultar el mensaje de carga y mostrar formulario
            mensajeCarga.style.display = 'none';
            contenedorFormulario.style.display = 'block';
            
        } else {
            alert('Error: Integrante no encontrado');
            window.location.href = 'indexIntegrantes.html';
        }
        
    } catch (error) {
        console.error('Error al cargar integrante:', error);
        alert('Error al cargar datos: ' + error.message);
        window.location.href = 'indexIntegrantes.html';
    }
}

// FUNCIÓN para actualizar un integrante existente

export async function actualizarIntegrante() {
    // Obtener el ID del integrante
    const id = document.getElementById('integranteId').value;
    
    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const rol = document.getElementById('rol').value.trim();
    const fotoUrl = document.getElementById('fotoUrl').value.trim();
    
    const biografiaParrafo1 = document.getElementById('biografiaParrafo1').value.trim();
    const biografiaParrafo2 = document.getElementById('biografiaParrafo2').value.trim();
    const biografiaParrafo3 = document.getElementById('biografiaParrafo3').value.trim();
    const biografiaParrafo4 = document.getElementById('biografiaParrafo4').value.trim();
    
    const logro1 = document.getElementById('logro1').value.trim();
    const logro2 = document.getElementById('logro2').value.trim();
    const logro3 = document.getElementById('logro3').value.trim();
    const logro4 = document.getElementById('logro4').value.trim();
    
    const estiloMusical = document.getElementById('estiloMusical').value.trim();

    // Validar que no hayan campos vacíos
    if (!nombre || !rol || !fotoUrl || !biografiaParrafo1 || !biografiaParrafo2 || 
        !biografiaParrafo3 || !biografiaParrafo4 || !logro1 || !logro2 || 
        !logro3 || !logro4 || !estiloMusical) {
        
        mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    // Crear un objeto con los datos actualizados
    const datosActualizados = {
        nombre: nombre,
        rol: rol,
        fotoUrl: fotoUrl,
        biografiaParrafo1: biografiaParrafo1,
        biografiaParrafo2: biografiaParrafo2,
        biografiaParrafo3: biografiaParrafo3,
        biografiaParrafo4: biografiaParrafo4,
        logros: [logro1, logro2, logro3, logro4],
        estiloMusical: estiloMusical,
        fechaActualizacion: Timestamp.now()
    };

    // Mostrar el mensaje de carga
    mostrarMensaje('Actualizando integrante...', 'info');

    try {
        // Actualizar en Firestore
        const docRef = doc(db, COLECCION_INTEGRANTES, id);
        await updateDoc(docRef, datosActualizados);
        
        mostrarMensaje('El integrante ha sido actualizado exitosamente', 'success');
        
        // Redirigir a la lista después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'indexIntegrantes.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al actualizar integrante:', error);
        mostrarMensaje('Error al actualizar: ' + error.message, 'error');
    }
}

// FUNCIÓN para eliminar a un integrante

let idIntegranteEliminar = null;
let modalEliminar = null;

export function confirmarEliminar(id, nombre) {
    // Guardar el ID del integrante a eliminar
    idIntegranteEliminar = id;
    
    // Actualizar el nombre en el modal
    document.getElementById('nombreEliminar').textContent = nombre;
    
    // Mostrar el modal usando Bootstrap
    if (!modalEliminar) {
        modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
    }
    modalEliminar.show();
}

async function eliminarIntegrante() {
    if (!idIntegranteEliminar) {
        return;
    }

    try {
        // Eliminar de Firestore
        const docRef = doc(db, COLECCION_INTEGRANTES, idIntegranteEliminar);
        await deleteDoc(docRef);
        
        // Cerrar el modal
        cerrarModal();
        
        // Mostrar el mensaje de éxito
        alert('Integrante eliminado exitosamente');
        
        // Recargar la lista
        cargarIntegrantes();
        
        // Limpiar variable
        idIntegranteEliminar = null;
        
    } catch (error) {
        console.error('Error al eliminar integrante:', error);
        alert('Error al eliminar: ' + error.message);
    }
}

// FUNCIONES AUXILIARES

// Mostrar los mensajes de estado en los formularios
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

// Cerrar el modal de confirmación
function cerrarModal() {
    if (modalEliminar) {
        modalEliminar.hide();
    }
    idIntegranteEliminar = null;
}

// EVENT LISTENERS

// Configurar listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar el botón "confirmar" y eliminar del modal
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', eliminarIntegrante);
    }
});

// Exponer la función confirmarEliminar globalmente para los botones onclick
window.confirmarEliminar = confirmarEliminar;