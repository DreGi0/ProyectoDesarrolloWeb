// js/login.js
import {loginUser } from "./auth.js";

//Login 
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Se ejecutó el submit del login")

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
    window.location.href = "./dashboard.html"; 
    
    }else{
        alert("Correo y/o contraseña incorrectos");
    }

    if(loginBtn && original !== null){
        loginBtn.disabled = false;
        loginBtn.innerHTML = original;
    }
  });
}
