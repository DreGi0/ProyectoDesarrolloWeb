// Gestión completa de los usuarios (CRUD)

// Importar Firebase desde el archivo firebase.js
import { db, auth } from './firebase.js';
import{updatePassword} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

//importar función para editar 
import { canEditUser } from './auth.js';

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
const COLECCION_USUARIOS = 'usuarios';

// FUNCIÓN para leer todos los usuarios

export async function cargarUsuarios() {
    const tbody = document.getElementById('listaUsuarios');
    const mensajeVacio = document.getElementById('mensajeVacio');
    
    // Mostrar el mensaje de carga
    tbody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando usuarios...</p>
            </td>
        </tr>
    `;
    
    try {
        // Obtener de Firebase todos los usuarios ordenados por fecha
        const q = query(
            collection(db, COLECCION_USUARIOS),
            orderBy('fechaCreacion', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        // Limpiar la tabla
        tbody.innerHTML = '';
        
        // Verificar si hay usuarios
        if (querySnapshot.empty) {
            tbody.innerHTML = '';
            mensajeVacio.style.display = 'block';
            return;
        }
        
        mensajeVacio.style.display = 'none';
        
        // Recorrer cada usuario y crear una fila en la tabla
        querySnapshot.forEach((docSnapshot) => {
            const usuario = docSnapshot.data();
            const id = docSnapshot.id;
            
            // Valores por defecto si los campos no existen
            const nombre = usuario.firstName ||  usuario.nombre ||'Sin nombre';
            const apellido = usuario.lastName || usuario.apellido ||'Sin apellido';

        
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="fw-bold">${nombre}</td>
                <td>${apellido}</td>
                <td>${usuario.email || 'Sin correo'}</td>
                <td>
                    <a href="editarUsuarios.html?id=${id}" 
                        class="btn btn-sm btn-primary me-1 btn-editar"
                        data-uid="${id}"
                        title = "Editar">
                        <i class="bi bi-pencil-square"></i> Editar
                    </a>
                    <button 
                    class = "btn btn-sm btn-danger btn-eliminar"
                    data-uid = "${id}"
                    data-nombre = "${nombre} ${apellido}"
                    title = "Eliminar">
                    <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;
            
            tbody.appendChild(fila);

            //Aplicar los permisos, después de agregar la fila
            const btnEditar = fila.querySelector('.btn-editar');
            const btnConfirmarEliminar = fila.querySelector('.btn-eliminar');

            if(!btnEditar || !btnConfirmarEliminar){
                console.warn("No se encontró la opción solicitada");
                return;
            }

            if(!canEditUser(id)){
                //Si no se puede editar el usuario
                btnEditar.classList.add('disabled');
                btnEditar.style.pointerEvents = 'none';
                
                btnConfirmarEliminar.classList.add('disabled');
                btnConfirmarEliminar.style.pointerEvents = 'none';
            }else{
                //Solo si puede se agrrga la función de eliminar 
                btnConfirmarEliminar.addEventListener('click', () =>{
                    const nombre = btnConfirmarEliminar.getAttribute('data-nombre');
                    window.confirmarEliminar(id, nombre);
                })
            }
        });
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error al cargar usuarios: ${error.message}
                </td>
            </tr>
        `;
    }
}

// FUNCIÓN para leer un usuario en específico

export async function cargarDatosUsuario(id) {
    const mensajeCarga = document.getElementById('mensajeCarga');
    const contenedorFormulario = document.getElementById('contenedorFormulario');
    
    try {
        // Obtener de Firebase el usuario por ID
        const docRef = doc(db, COLECCION_USUARIOS, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const usuario = docSnap.data();
            
            // Llenar el formulario con los datos (con valores por defecto si no existen)
            document.getElementById('usuarioId').value = id;
            document.getElementById('nombre').value = usuario.nombre || usuario.firstName|| '';
            document.getElementById('apellido').value = usuario.apellido || usuario.lastName|| '';
            document.getElementById('email').value = usuario.email || '';
            
            // Ocultar el mensaje de carga y mostrar formulario
            mensajeCarga.style.display = 'none';
            contenedorFormulario.style.display = 'block';
            
        } else {
            alert('Error: usuario no encontrado');
            window.location.href = 'indexUsuarios.html';
        }
        
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        alert('Error al cargar datos: ' + error.message);
        window.location.href = 'indexUsuarios.html';
    }
}

// FUNCIÓN para actualizar un usuario existente

export async function actualizarUsuario() {
    // Obtener el ID del usuario
    const id = document.getElementById('usuarioId').value;
    
    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();

    // Validar que no hayan campos vacíos
    if (!nombre || !apellido || !email) {
        mostrarMensaje('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    // Crear un objeto con los datos actualizados
    const datosActualizados = {
        nombre: nombre,
        apellido: apellido,
        email: email,
        fechaActualizacion: Timestamp.now()
    };

    // Mostrar el mensaje de carga
    mostrarMensaje('Actualizando usuario...', 'info');

    try {
        // Actualizar la contraseña si se proporcionó una nueva
        if (nuevaContraseña !== '') {
            try {
                await updatePassword(auth.currentUser, nuevaContraseña);
                mostrarMensaje('Contraseña actualizada correctamente', 'success');
            } catch (error) {
                console.error('Error al actualizar contraseña:', error);
                mostrarMensaje('Error al actualizar contraseña: ' + error.message, 'error');
                return; 
            }
        }

        // Actualizar en Firestore
        const docRef = doc(db, COLECCION_USUARIOS, id);
        await updateDoc(docRef, datosActualizados);
        
        mostrarMensaje('El usuario ha sido actualizado exitosamente', 'success');
        
        // Redirigir a la lista después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'indexUsuarios.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        mostrarMensaje('Error al actualizar: ' + error.message, 'error');
    }
}

// FUNCIÓN para eliminar a un usuario

let idUsuarioEliminar = null;
let modalEliminar = null;

export function confirmarEliminar(id, nombre) {
    // Guardar el ID del usuario a eliminar
    idUsuarioEliminar = id;
    
    // Actualizar el nombre en el modal
    document.getElementById('nombreEliminar').textContent = nombre;
    
    // Mostrar el modal usando Bootstrap
    if (!modalEliminar) {
        modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
    }
    modalEliminar.show();
}

async function eliminarUsuario() {
    if (!idUsuarioEliminar) {
        return;
    }

    try {
        // Eliminar de Firestore
        const docRef = doc(db, COLECCION_USUARIOS, idUsuarioEliminar);
        await deleteDoc(docRef);
        
        // Cerrar el modal
        cerrarModal();
        
        // Mostrar el mensaje de éxito
        alert('Usuario eliminado exitosamente');
        
        // Recargar la lista
        cargarUsuarios();
        
        // Limpiar variable
        idUsuarioEliminar = null;
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
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
    idUsuarioEliminar = null;
}

// EVENT LISTENERS

// Configurar listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar el botón "confirmar" y eliminar del modal
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', eliminarUsuario);
    }
});

// Exponer la función confirmarEliminar globalmente para los botones onclick
window.confirmarEliminar = confirmarEliminar;