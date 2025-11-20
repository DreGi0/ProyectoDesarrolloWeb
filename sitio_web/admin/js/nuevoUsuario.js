import { registerUser, requireAuth, isAdmin } from "./auth.js";

window.addEventListener("DOMContentLoaded", async () => {

  // Asegurar que esté logueado
  await requireAuth();

  if(!isAdmin ()){
    alert("No tienes permisos para registrar usuarios.")
    window.location.href = "../usuarios/indexUsuarios.html"
  }

  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("idFirstName").value.trim();
    const lastName  = document.getElementById("idLastName").value.trim();
    const email     = document.getElementById("usuario").value.trim();
    const password  = document.getElementById("password").value;

    const ok = await registerUser(email, password, firstName, lastName);

    if (ok) {
      alert("Usuario creado correctamente");

      // Redirigir de regreso a la lista
      setTimeout(() => {
        window.location.href = "../usuarios/indexUsuarios.html";
      }, 700);
    } else {
      alert("No se pudo crear el usuario. Ver consola.");
    }
  });
});
