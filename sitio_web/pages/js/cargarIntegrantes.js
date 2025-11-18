// Importar Firebase desde la carpeta admin
import { db } from '../../admin/js/firebase.js';
import { 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const COLECCION_INTEGRANTES = 'integrantes';

// Función para cargar y mostrar integrantes en la página web
async function cargarIntegrantesPublico() {
    const contenedorTarjetas = document.getElementById('contenedorTarjetas');
    const contenedorInfo = document.getElementById('contenedorInfoIntegrantes');
    
    // Mostrar el mensaje de carga
    contenedorTarjetas.innerHTML = `
        <div style="text-align: center; padding: 2rem; width: 100%;">
            <p style="font-size: 1.2rem; color: #666;">Cargando integrantes...</p>
        </div>
    `;
    
    try {
        // Obtener a los integrantes desde Firebase
        const q = query(
            collection(db, COLECCION_INTEGRANTES),
            orderBy('fechaCreacion', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        
        // Limpiar los contenedores
        contenedorTarjetas.innerHTML = '';
        contenedorInfo.innerHTML = '';
        
        // Verificar si hay datos
        if (querySnapshot.empty) {
            contenedorTarjetas.innerHTML = `
                <div style="text-align: center; padding: 2rem; width: 100%;">
                    <p style="font-size: 1.2rem; color: #666;">No hay integrantes disponibles en este momento</p>
                </div>
            `;
            return;
        }
        
        // Generar el HTML para cada integrante
        querySnapshot.forEach((docSnapshot) => {
            const integrante = docSnapshot.data();
            const id = docSnapshot.id;
            
            // Crear la tarjeta
            contenedorTarjetas.innerHTML += crearTarjeta(integrante, id);
            
            // Crear el overlay de información
            contenedorInfo.innerHTML += crearOverlay(integrante, id);
        });
        
        console.log(`Se cargaron ${querySnapshot.size} integrante(s) exitosamente`);
        
    } catch (error) {
        console.error('Error al cargar integrantes:', error);
        contenedorTarjetas.innerHTML = `
            <div style="text-align: center; padding: 2rem; width: 100%;">
                <p style="font-size: 1.2rem; color: #dc3545;">Error al cargar los integrantes</p>
                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">Por favor, intenta recargar la página</p>
                <p style="font-size: 0.8rem; color: #999; margin-top: 1rem;">Error técnico: ${error.message}</p>
            </div>
        `;
    }
}

// Función para crear el HTML de tarjeta
function crearTarjeta(integrante, id) {
    const nombre = integrante.nombre || 'Sin nombre';
    const rol = integrante.rol || 'Sin rol';
    const fotoUrl = integrante.fotoUrl || 'https://via.placeholder.com/400x400?text=Sin+Foto';
    
    return `
        <article class="tarjeta-artista">
            <a href="#info-${id}" class="link-artista">
                <figure>
                    <img
                        src="${fotoUrl}"
                        alt="${nombre}"
                        class="foto-artista"
                        onerror="this.src='https://via.placeholder.com/400x400?text=Error+al+cargar'"
                    />
                    <figcaption>
                        <h3>${nombre}</h3>
                        <p>${rol}</p>
                    </figcaption>
                </figure>
            </a>
        </article>
    `;
}

// Función para crear el HTML del overlay de información
function crearOverlay(integrante, id) {
    const nombre = integrante.nombre || 'Sin nombre';
    const rol = integrante.rol || 'Sin rol';
    const fotoUrl = integrante.fotoUrl || 'https://via.placeholder.com/400x400?text=Sin+Foto';
    
    // Construir los párrafos de la biografía
    const biografiaParrafos = [
        integrante.biografiaParrafo1,
        integrante.biografiaParrafo2,
        integrante.biografiaParrafo3,
        integrante.biografiaParrafo4
    ];
    
    const parrafosHTML = biografiaParrafos
        .filter(p => p && p.trim() !== '')
        .map(p => `<p>${p}</p>`)
        .join('');
    
    // Construir la lista de logros
    const logros = integrante.logros || [];
    const logrosHTML = logros
        .filter(logro => logro && logro.trim() !== '')
        .map(logro => `<li>${logro}</li>`)
        .join('');
    
    const estiloMusical = integrante.estiloMusical || '';
    
    return `
        <div id="info-${id}" class="info-overlay">
            <div class="contenedor-info">
                <a href="#" class="btn-cerrar">✕</a>
                <div class="contenido">
                    <img
                        src="${fotoUrl}"
                        alt="${nombre}"
                        class="foto-artista"
                        onerror="this.src='https://via.placeholder.com/400x400?text=Error+al+cargar'"
                    />
                    <div class="texto-info">
                        <h2>${nombre}</h2>
                        <p class="rol">${rol}</p>
                        ${parrafosHTML}
                        ${logrosHTML ? `
                            <h3>Logros</h3>
                            <ul>${logrosHTML}</ul>
                        ` : ''}
                        ${estiloMusical ? `
                            <h3>Estilo Musical</h3>
                            <p>${estiloMusical}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Cargar a los integrantes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando la carga de los integrantes...');
    cargarIntegrantesPublico();
});