// cargarEventosCalendario.js
import { db } from '../../admin/js/firebase.js';
import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const COLLECCION_EVENTOS = 'eventos';

export async function inicializarCalendarioConEventos() {
    try {
        const q = query(
            collection(db, COLLECCION_EVENTOS),
            orderBy('fechaHora', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const eventos = {};

        querySnapshot.forEach((docSnapshot) => {
            const evento = docSnapshot.data();
            const fecha = evento.fecha; // Formato YYYY-MM-DD

            if (!eventos[fecha]) {
                eventos[fecha] = [];
            }

            eventos[fecha].push({
                id: docSnapshot.id,
                titulo: evento.titulo || 'Sin título',
                hora: evento.hora || 'Sin hora',
                lugar: evento.lugar || 'Sin lugar',
                descripcion: evento.descripcion || '',
                tipo: evento.tipo || 'general'
            });
        });

        console.log('Eventos cargados:', eventos);
        return eventos;

    } catch (error) {
        console.error('Error al cargar eventos:', error);
        return {};
    }
}