import { auth } from "./firebase.js";
import { getCurrentUser } from "./auth.js";
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.getElementById("contenedorFormulario").style.display = "block";

const form = document.getElementById("formCambiarContrasena");
const mensaje = document.getElementById("mensajeCambiarPass");

form.addEventListener("submit", async (x) => {
    x.preventDefault();

    const passActual = document.getElementById("passwordActual").value;
    const nuevaPass = document.getElementById("passwordNueva").value;
    const confirmar = document.getElementById("passwordConfirmar").value;

    if (nuevaPass !== confirmar) {
        mostrarMensaje("Las contraseñas nuevas no coinciden.", "danger");
        return;
    }


    try {
        const userData = getCurrentUser();
        const user = auth.currentUser;

        if (!user || !userData) {
            mostrarMensaje("No se encontró usuario activo.", "danger");
            return;
        }

        const cred = EmailAuthProvider.credential(
            userData.email,
            passActual
        );

        await reauthenticateWithCredential(user, cred);

        await updatePassword(user, nuevaPass);

        mostrarMensaje("Contraseña actualizada correctamente.", "success");
        form.reset();

    } 

    catch (error) {
        if (error.code === "auth/weak-password") {
            mostrarMensaje("La nueva contraseña debe tener al menos 6 caracteres.", "danger");
        } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            mostrarMensaje("La contraseña actual no es correcta.", "danger");
        } else {
            mostrarMensaje("Error al cambiar la contraseña: " + error.message, "danger");
        }
    }

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = `alert alert-${tipo}`;
        mensaje.classList.remove("d-none");
    }});
