// js/login.js
import { registerUser, loginUser } from "./auth.js";

const registerForm = document.getElementById("registerForm");

if (registerForm) {

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email     = document.getElementById("usuario").value;
    const password  = document.getElementById("password").value;
    const firstName = document.getElementById("idFirstName").value;
    const lastName  = document.getElementById("idLastName").value;

    console.log("[login.js] Datos de registro:", {firstName, lastName, email});

    const ok = await registerUser(email, password, firstName, lastName);

    if (ok) {
      alert("Usuario creado correctamente");
      
      setTimeout(() =>{
            window.location.href = "../login.html";
      }, 500);

    } else {
      alert("Error: el correo ya está registrado o hubo un problema");
    }
  });
}

//Login 
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    let loginBtn = e.submitter || 
    document.getElementById("BtnIngresar") ||
    loginForm.querySelector("button[type = 'submit']");

    let original = loginBtn ? loginBtn.innerHTML: null;
    if(loginBtn){
        loginBtn.disabled = true;
        loginBtn.innerHTML = "Ingresando...";
    }
    const userData = await loginUser(email, password);

    if (userData){
    //misma vista para admin y user/empleado
    window.location.href = "../index.html";
    }else{
        alert("Correo y/o contraseña incorrectos");
    }

    if(loginBtn && original !== null){
        loginBtn.disabled = false;
        loginBtn.innerHTML = original;
    }
  });
}
