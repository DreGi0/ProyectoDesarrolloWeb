// Importar Firebase desde la carpeta admin
import { db } from "../../admin/js/firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const COLECCION_DISCOGRAFIA = "discografía";

// Función para cargar y mostrar integrantes en la página web
async function cargarDiscografiaPublico() {
  const contenedorDiscografia = document.getElementById(
    "contenedorDiscografia"
  );

  // Mostrar el mensaje de carga
  contenedorDiscografia.innerHTML = `
        <div style="text-align: center; padding: 2rem; width: 100%;">
            <p style="font-size: 1.2rem; color: #666;">Cargando discografía...</p>
        </div>
    `;

  try {
    const q = query(
      collection(db, COLECCION_DISCOGRAFIA),
      orderBy("titulo", "asc")
    );

    const querySnapshot = await getDocs(q);

    // Limpiar el contenedor
    contenedorDiscografia.innerHTML = "";
    // Verificar si hay datos
    if (querySnapshot.empty) {
      contenedorDiscografia.innerHTML = `
                <div style="text-align: center; padding: 2rem; width: 100%;">
                    <p style="font-size: 1.2rem; color: #666;">No hay discografía disponible en este momento</p>
                </div>
            `;
      return;
    }

    // Generar el HTML para cada album
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const portada = data.portada;
      // Crear variable para mostrar las canciones en el html
      let canciones = "";

      if (Array.isArray(data.tracklist)) {
        const cancionesOrdenadas = data.tracklist.sort(
          (a, b) => a.cancion - b.cancion
        );

        cancionesOrdenadas.forEach((track) => {
          const audio = track.audioLink || "";
          canciones += `<div class="cancion">
        <span class="titulo-cancion"> ${track.cancion}. ${track.titulo} </span>
        <audio controls src="${track.audioLink}" class="audio"> </audio>
        <span class="duracion-cancion">${track.duracion}</span>
      </div>`;
        });
      }

      // Crear el HTML para el album
      const album = `<div class="album">
          <div class="portada">
          <img src=${portada} alt="${data.titulo}"></img>
          </div>
            
            <div class="canciones">
            <h2 class="titulo">${data.titulo}</h2>
            <h4 class="subtitulo">Tracklist</h4>
            ${canciones}
            <section class="creditos">
              <span>${data.fecha}</span>
              <span class="deco">・</span>
              <span>${data.productora}</span>
              <span class="deco">・</span>
              <span>${data.totalCanciones} ・ ${data.totalMinutos}</span>
            </section>
            </div>
        </div>`;
      contenedorDiscografia.innerHTML += album;
    });

    console.log(`Se cargaron ${querySnapshot.size} album(es) exitosamente`);
  } catch (error) {
    console.error("Error al cargar la discografía");
    contenedorDiscografia.innerHTML = `
            <div style="text-align: center; padding: 2rem; width: 100%;">
                <p style="font-size: 1.2rem; color: #dc3545;">Error al cargar la discografía</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">Por favor, intenta recargar la página</p>
                <p style="font-size: 0.8rem; color: #999; margin-top: 1rem;">Error técnico: ${error.message}</p>
            </div>
        `;
  }
}

// Cargar a los integrantes cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("Iniciando la carga de la discografía...");
  cargarDiscografiaPublico();
});
