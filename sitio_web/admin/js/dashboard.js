import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { getCurrentUser, requireAuth } from "./auth.js";

// Saludo de usuario en el dashboard
const user = getCurrentUser();
if (user) {
    document.getElementById("nombreUsuario").textContent = user.firstName;
} else {
    document.getElementById("nombreUsuario").textContent = "Usuario";
}

// Frase en el dashboard
const frases = [
    "No esperes a que las oportunidades lleguen, créalas tú mismo.",
    "Cada día es una nueva oportunidad para mejorar.",
    "“Just keep moving forward, no matter what.” - Harry Styles",
    "No te rindas, cada error es un paso hacia el éxito.",
    "“Just stop your crying, it'll be alright.” - Harry Styles, “Sign of the Times”",
    "“Luces en la carretera, pero aún tú brillas más.” - Alleh & Yorghaki, “La Ciudad”",
    "“Treat people with kindness.” - Harry Styles",
    "“Ser igual cuando nadie te ve.” - Alleh & Yorghaki, “El Ingeniero”"
];

function fraseAleatoria() {
    const indice = Math.floor(Math.random() * frases.length);
    return frases[indice];
}

document.getElementById("fraseMotivadora").textContent = fraseAleatoria();
setInterval(() => {
    document.getElementById("fraseMotivadora").textContent = fraseAleatoria();
}, 10000); 

// Notas en el dashboard
window.addEventListener("DOMContentLoaded", () => {
    requireAuth().then(() => {
        const user = getCurrentUser();
        if (!user) return;

        const notasTextarea = document.getElementById("notasToDo");
        const btnGuardarNotas = document.getElementById("guardarNotas");

        const notasGuardadas = localStorage.getItem("notasToDo_" + user.uid);
        if (notasGuardadas) {
            notasTextarea.value = notasGuardadas;
        }

        btnGuardarNotas.addEventListener("click", () => {
            localStorage.setItem("notasToDo_" + user.uid, notasTextarea.value);
            alert("Notas guardadas correctamente.");
        });
    });
});


// Resumen de datos en el dashboard
async function cargarResumen() {
    try {
        const discografiaSnap = await getDocs(collection(db, "discografía"));
        const usuariosSnap = await getDocs(collection(db, "usuarios"));
        const integrantesSnap = await getDocs(collection(db, "integrantes"));

        // Contar canciones sumando el tracklist de cada disco
        let totalCanciones = 0;
        discografiaSnap.forEach((doc) => {
            const tracklist = doc.data().tracklist;
            if (Array.isArray(tracklist)) {
                totalCanciones += tracklist.length;
            }
        });

        document.getElementById("numDiscos").textContent = discografiaSnap.size;
        document.getElementById("numCanciones").textContent = totalCanciones;
        document.getElementById("numUsuarios").textContent = usuariosSnap.size;

        document.getElementById("numIntegrantes").textContent = integrantesSnap.size;

        console.log("[Dashboard] Resumen cargado correctamente desde Firebase");
    } catch (error) {
        console.error("[Dashboard] Error cargando resumen desde Firebase:", error);
        document.getElementById("numDiscos").textContent = "0";
        document.getElementById("numCanciones").textContent = "0";
        document.getElementById("numUsuarios").textContent = "0";
        document.getElementById("numIntegrantes").textContent = "0";
    }
}

cargarResumen();
