// Gestión completa de la discografía (CRUD)

// Importar Firebase desde el archivo firebase.js
import { db } from "./firebase.js";

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
  Timestamp,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Variables globales
const COLECCION_DISCOGRAFIA = "discografía";

// FUNCIÓN para crear nuevo album

export function generarInputsCanciones(cantidad, contenedor) {
  const contenedorTracklist = document.getElementById("contenedorTracklist");
  contenedorTracklist.innerHTML = "";

  for (let i = 1; i <= cantidad; i++) {
    const tablaRow = `
    <h3> Canción ${i} </h3>
    <div class="mb-3">
                       <label for="trackNumero${i}" class="form-label"  >Número en tracklist *</label>
                      <input
                        type="number"
                        class="form-control"
                        id="trackNumero${i}"
                        placeholder="1"
                        required
                      />
                    </div>

                    <div class="mb-3">
                    <label for="trackNombre${i}" class="form-label"
                        >Nombre de la canción *</label>
                      <input
                        class="form-control"
                        id="trackNombre${i}"
                        placeholder="Ej: La ciudad"
                        required
                      />
                    </div>

                    <div class="mb-3">
                    <label for="trackUrl${i}" class="form-label"
                        >URL del audio *</label>
                      <input
                        class="form-control"
                        id="trackUrl${i}"
                        placeholder="https://ejemplo.com/audio.mp3"
                        required
                      />
                    </div>
                    
                    <div class="mb-3">
                    <label for="trackDuracion${i}" class="form-label"
                        >Duración *</label>
                      <input
                        class="form-control"
                        id="trackDuracion${i}"
                        pattern="[0-9]+:[0-9]{2}"
                        title="Sigue el formato minutos:segundos. (2:23)"
                        placeholder="2:23"
                        required
                      />
                    </div>`;
    contenedorTracklist.innerHTML += tablaRow;
  }
}

export async function crearAlbum() {
  // Obtener los valores del formulario

  // Información general del album
  const titulo = document.getElementById("titulo").value.trim();
  const numCanciones = document.getElementById("numCanciones").value;
  const portada = document.getElementById("portada").value.trim();

  if (!titulo || !numCanciones || !portada) {
    mostrarMensaje("Por favor complete la información básica", "error");
    return;
  }

  const arrayTracklist = [];

  for (let i = 1; i <= numCanciones; i++) {
    const numTracklist = document.getElementById(`trackNumero${i}`).value;
    const nombreCancion = document.getElementById(`trackNombre${i}`).value;
    const duracion = document.getElementById(`trackDuracion${i}`).value.trim();
    const audioLink = document.getElementById(`trackUrl${i}`).value.trim();

    if (!nombreCancion || !duracion || !audioLink) {
      mostrarMensaje(`Por favor complete los datos en el track #${i}`, "error");
      return;
    }

    arrayTracklist.push({
      cancion: parseInt(numTracklist),
      titulo: nombreCancion,
      duracion: duracion,
      audioLink: audioLink,
    });
  }

  // Créditos
  const fecha = document.getElementById("fecha").value;
  const productora = document.getElementById("productora").value.trim();

  // Validar que no hayan campos vacíos
  if (!titulo || !numCanciones || !portada || !fecha || !productora) {
    mostrarMensaje("Por favor complete todos los campos obligatorios", "error");
    return;
  }

  const totalMinutos = calcularDuracionTotal(arrayTracklist);
  // Crear un objeto con los datos del integrante
  const nuevoAlbum = {
    titulo: titulo,
    numCanciones: numCanciones,
    portada: portada,
    tracklist: arrayTracklist,
    fecha: fecha,
    productora: productora,
    totalCanciones: numCanciones + " canciones",
    totalMinutos: totalMinutos,
    fechaCreacion: Timestamp.now(),
  };

  // Mostrar el mensaje de carga
  mostrarMensaje("Guardando album...", "info");

  try {
    // Guardar en Firestore
    await addDoc(collection(db, COLECCION_DISCOGRAFIA), nuevoAlbum);

    mostrarMensaje("El album ha sido creado exitosamente", "success");

    // Redirigir a la lista después de 1.5 segundos
    setTimeout(() => {
      window.location.href = "indexDiscografia.html";
    }, 1500);
  } catch (error) {
    console.error("Error al crear album:", error);
    mostrarMensaje("Error al guardar: " + error.message, "error");
  }
}

function calcularDuracionTotal(listaCanciones) {
  let segundosTotal = 0;

  listaCanciones.forEach((cancion) => {
    if (cancion.duracion && cancion.duracion.includes(":")) {
      const separacion = cancion.duracion.split(":");
      const minutos = parseInt(separacion[0]);
      const segundos = parseInt(separacion[1]);

      segundosTotal += minutos * 60 + segundos;
    }
  });

  const minutosTotales = Math.floor(segundosTotal / 60, 2);
  return `${minutosTotales} minutos`;
}

// FUNCIÓN para leer todos los albumes

export async function cargarDiscografia() {
  const tbody = document.getElementById("listaAlbumes");
  const mensajeVacio = document.getElementById("mensajeVacio");

  // Mostrar el mensaje de carga
  tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando discografía...</p>
            </td>
        </tr>
    `;

  try {
    // Obtener de Firebase todos los integrantes ordenados por fecha
    const q = query(
      collection(db, COLECCION_DISCOGRAFIA),
      orderBy("titulo", "asc")
    );

    const querySnapshot = await getDocs(q);

    // Limpiar la tabla
    tbody.innerHTML = "";

    // Verificar si hay integrantes
    if (querySnapshot.empty) {
      tbody.innerHTML = "";
      mensajeVacio.style.display = "block";
      return;
    }

    mensajeVacio.style.display = "none";

    // Recorrer cada integrante y crear una fila en la tabla
    querySnapshot.forEach((docSnapshot) => {
      const album = docSnapshot.data();
      const id = docSnapshot.id;
      const portada = album.portada || "https://via.placeholder.com/80";

      let listaCancionesTabla = '<ul class="list-unstyled small mb-0" >';
      if (album.tracklist && Array.isArray(album.tracklist)) {
        const cancionesOrdenadas = album.tracklist.sort(
          (a, b) => a.cancion - b.cancion
        );

        cancionesOrdenadas.forEach((track) => {
          listaCancionesTabla += `<li><strong>${track.cancion}.</strong> ${track.titulo} </li>`;
        });
      } else {
        listaCancionesTabla += `<li class="text-muted">No hay canciones registradas</li>`;
      }

      const infoTotal = `${album.totalCanciones || "0 canciones"} - ${
        album.totalMinutos || "0 minutos"
      }`;
      const fila = document.createElement("tr");
      fila.innerHTML = `
                <td>
                    <img src="${portada}" alt="${album.titulo}" class="img-thumbnail" style="width: 80px; height: 80px; object-fit: cover;">
                </td>
                <td class="fw-bold">${album.titulo}</td>
                <td>${listaCancionesTabla}</td>
                <td>
                  <span class="credito-item">${album.fecha}</span> <br>
                  <span class="credito-item">${album.productora}</span> <br>
                  <span class="credito-item">${infoTotal}</span></td>
                <td>
                    <a href="editarDiscografia.html?id=${id}" class="btn btn-sm btn-primary me-1" title="Editar">
                        <i class="bi bi-pencil-square"></i> Editar
                    </a>
                    <button onclick="window.confirmarEliminar('${id}', '${album.titulo}')" class="btn btn-sm btn-danger" title="Eliminar">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            `;

      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar discografía:", error);
    tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error al cargar discografía: ${error.message}
                </td>
            </tr>
        `;
  }
}

// FUNCIÓN para leer un album en específico
export async function cargarDatosAlbum(id) {
  const mensajeCarga = document.getElementById("mensajeCarga");
  const contenedorFormulario = document.getElementById("contenedorFormulario");

  try {
    // Obtener de Firebase el album por ID
    const docRef = doc(db, COLECCION_DISCOGRAFIA, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const album = docSnap.data();

      let cantidad = album.numCanciones;

      if (!cantidad && album.totalCanciones) {
        cantidad = parseInt(album.totalCanciones);
      }

      if (!cantidad && album.tracklist && Array.isArray(album.tracklist)) {
        cantidad = album.tracklist.length;
      }
      cantidad = cantidad || 0;

      // Llenar el formulario con los datos (con valores por defecto si no existen)
      document.getElementById("albumId").value = id;
      document.getElementById("titulo").value = album.titulo || "";
      document.getElementById("numCanciones").value = cantidad;

      const inputPortada =
        document.getElementById("portada") ||
        document.getElementById("fotoUrl");

      if (inputPortada) {
        const imgUrl =
          album.portada || album.fotoUrl || album.url_portada || "";

        inputPortada.value = imgUrl;

        const vistaPrevia = document.getElementById("vistaPrevia");
        if (vistaPrevia) vistaPrevia.src = imgUrl;
      } else {
        console.warn("No se encontró input de la portada");
      }

      generarInputsCanciones(cantidad, "contenedorTracklist");

      if (album.tracklist && Array.isArray(album.tracklist)) {
        album.tracklist.forEach((track, index) => {
          const i = index + 1;
          const inputNombre = document.getElementById(`trackNombre${i}`);
          if (inputNombre) {
            document.getElementById(`trackNumero${i}`).value =
              track.cancion || i;
            inputNombre.value = track.titulo || track.nombreCancion || "";
            document.getElementById(`trackDuracion${i}`).value =
              track.duracion || "";
            document.getElementById(`trackUrl${i}`).value =
              track.audioLink || "";
          }
        });
      }

      // Créditos
      document.getElementById("fecha").value = album.fecha || "";
      document.getElementById("productora").value = album.productora || "";

      // Ocultar el mensaje de carga y mostrar formulario
      mensajeCarga.style.display = "none";
      contenedorFormulario.style.display = "block";
    } else {
      alert("Error: Album no encontrado");
      window.location.href = "indexDiscografia.html";
    }
  } catch (error) {
    console.error("Error al cargar album:", error);
    alert("Error al cargar datos: " + error.message);
    window.location.href = "indexDiscografia.html";
  }
}

// FUNCIÓN para actualizar un album existente

export async function actualizarAlbum() {
  // Obtener el ID del album
  const id = document.getElementById("albumId").value;

  // Información general del album
  const titulo = document.getElementById("titulo").value.trim();
  const numCanciones = document.getElementById("numCanciones").value;
  const portada = document.getElementById("portada").value.trim();

  const arrayTracklist = [];

  for (let i = 1; i <= numCanciones; i++) {
    const numTracklist = document.getElementById(`trackNumero${i}`).value;
    const nombreCancion = document.getElementById(`trackNombre${i}`).value;
    const duracion = document.getElementById(`trackDuracion${i}`).value.trim();
    const audioLink = document.getElementById(`trackUrl${i}`).value.trim();

    if (numTracklist && nombreCancion && duracion && audioLink) {
      arrayTracklist.push({
        cancion: parseInt(numTracklist),
        titulo: nombreCancion,
        duracion: duracion,
        audioLink: audioLink,
      });
    }
  }

  // Créditos
  const fecha = document.getElementById("fecha").value;
  const productora = document.getElementById("productora").value.trim();

  // Validar que no hayan campos vacíos
  if (!titulo || !numCanciones || !portada || !fecha || !productora) {
    mostrarMensaje("Por favor complete todos los campos obligatorios", "error");
    return;
  }

  const totalMinutos = calcularDuracionTotal(arrayTracklist);

  // Crear un objeto con los datos actualizados
  const datosActualizados = {
    titulo: titulo,
    numCanciones: numCanciones,
    portada: portada,
    tracklist: arrayTracklist,
    fecha: fecha,
    productora: productora,
    totalCanciones: numCanciones + " canciones",
    totalMinutos: totalMinutos,
  };

  // Mostrar el mensaje de carga
  mostrarMensaje("Actualizando album...", "info");

  try {
    // Actualizar en Firestore
    const docRef = doc(db, COLECCION_DISCOGRAFIA, id);
    await updateDoc(docRef, datosActualizados);

    mostrarMensaje("El album ha sido actualizado exitosamente", "success");

    // Redirigir a la lista después de 1.5 segundos
    setTimeout(() => {
      window.location.href = "indexDiscografia.html";
    }, 1500);
  } catch (error) {
    console.error("Error al actualizar album:", error);
    mostrarMensaje("Error al actualizar: " + error.message, "error");
  }
}

// FUNCIÓN para eliminar un album

let idAlbumEliminar = null;
let modalEliminar = null;

export function confirmarEliminar(id, titulo) {
  // Guardar el ID del album a eliminar
  idAlbumEliminar = id;

  // Actualizar el nombre en el modal
  document.getElementById("nombreEliminar").textContent = titulo;

  // Mostrar el modal usando Bootstrap
  if (!modalEliminar) {
    modalEliminar = new bootstrap.Modal(
      document.getElementById("modalEliminar")
    );
  }
  modalEliminar.show();
}

async function eliminarAlbum() {
  if (!idAlbumEliminar) {
    return;
  }

  try {
    // Eliminar de Firestore
    const docRef = doc(db, COLECCION_DISCOGRAFIA, idAlbumEliminar);
    await deleteDoc(docRef);

    // Cerrar el modal
    cerrarModal();

    // Mostrar el mensaje de éxito
    alert("Album eliminado exitosamente");

    // Recargar la lista
    cargarDiscografia();

    // Limpiar variable
    idAlbumEliminar = null;
  } catch (error) {
    console.error("Error al eliminar integrante:", error);
    alert("Error al eliminar: " + error.message);
  }
}

// FUNCIONES AUXILIARES

// Mostrar los mensajes de estado en los formularios
function mostrarMensaje(texto, tipo) {
  const mensajeEstado = document.getElementById("mensajeEstado");

  if (!mensajeEstado) {
    return;
  }

  // Mapear los tipos a clases de Bootstrap
  const tiposBootstrap = {
    success: "alert-success",
    error: "alert-danger",
    info: "alert-info",
    warning: "alert-warning",
  };

  const claseAlerta = tiposBootstrap[tipo] || "alert-info";

  mensajeEstado.textContent = texto;
  mensajeEstado.className = "alert " + claseAlerta;
  mensajeEstado.style.display = "block";

  // Ocultar automáticamente después de 5 segundos (excepto si es error)
  if (tipo !== "error") {
    setTimeout(() => {
      mensajeEstado.style.display = "none";
    }, 5000);
  }
}

// Cerrar el modal de confirmación
function cerrarModal() {
  if (modalEliminar) {
    modalEliminar.hide();
  }
  idAlbumEliminar = null;
}

// EVENT LISTENERS

// Configurar listeners cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  // Configurar el botón "confirmar" y eliminar del modal
  const btnConfirmar = document.getElementById("btnConfirmarEliminar");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", eliminarAlbum);
  }
});

// Exponer la función confirmarEliminar globalmente para los botones onclick
window.confirmarEliminar = confirmarEliminar;
