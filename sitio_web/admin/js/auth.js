import {db, auth} from  './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
    collection, 
    getDocs, 
    getDoc,
    doc, 
    setDoc,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

//
const COLLECTION_USER = "user";

export function getCurrentUser (){
    const userData = sessionStorage.getItem(COLLECTION_USER);
    return userData ? JSON.parse(userData): null;
}

export function setCurrentUser(obj){
    sessionStorage.setItem(COLLECTION_USER, JSON.stringify(obj));
}

//Registro de usuarios 
export async function registerUser(email, password, firstName, lastName) {
    console.log("[auth] registerUser", {email, firstName, lastName});

    try{
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        await setDoc(doc(db, "usuarios", user.uid),{
            email,
            firstName,
            lastName,
            role: "user"  //Todos son user/empleados por defecto, admin se cambia en firebase y se le asigna
        });

        console.log('Usuario registrado:', email);
        return true;

    }catch(error){
        console.error("Error en registerUser:", error.message);
        return false;
    }
}

export async function loginUser(email, password) {

    try{
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        const snap = await getDoc(doc(db, "usuarios", user.uid));

        if(!snap.exists()){
            console.error("[auth] usuario en Auth, pero no en la colección 'usuarios'.");
            return null;
        }

        const userData = snap.data();

        const userObj ={
            uid: user.uid,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role
        };
        
        setCurrentUser(userObj);

        console.log("Login exitoso. Rol:", userData.role);
        return userObj;

    }catch(error){
        console.error("Error en login:", error.message);
        return null;
    }
}

//Obtener usuarios 
export const getUsers = async() =>{
    const result = await getDocs(collection(db, "usuarios"));
    return result.docs.map(d => ({id: d.id, ...d.data() }));
};

export const getUser = async (id) => {
    const result = await getDoc(doc(db, "usuarios", id));
    return result.exists() ? {id:result.id, ...result.data() } : null;
};

//Roles y permisos 

//saber si el usuario actual es admin 
export function isAdmin(){
    const u = getCurrentUser();
    return u && u.role == "admin";
}

//Solo admin tiene acceso a controlar todas las funciones 
export function canEditUser (targetUid){
    const u = getCurrentUser();
    if (!u) return false;

    if(u.role === "admin")
        return true;
    return u.uid === targetUid;
}

//Verifica si hay un usuario autenticado en Firebase 
export function checkAuth(){
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) =>{
            if (!user){     //Si no es usuario lo dirige a registrase
                sessionStorage.removeItem(COLLECTION_USER);
                window.location.href = "login.html";
                reject ("Usuario no autenticado");
                return;
            }

            //Si ya esta logueado en Firebase, se revisa en sessionStorage
            let current = getCurrentUser();
            if(!current){
                const snap = await getDoc(doc(db, "usuarios", user.uid));

                if(!snap.exists()){
                    await signOut(auth);
                    sessionStorage.removeItem(COLLECTION_USER);
                    window.location.href = "login.html";
                    reject("El usuario no existe en la colección 'usuarios'.");
                    return;
                }
                const userData = snap.data();

                current = {
                    uid: user.uid,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role
                };
                setCurrentUser(current);
            }
            resolve(current);
        });
    });
}
 
//llama al inicio de una página protegida
export async function requireAuth() {
    try{
        await checkAuth();
    }catch(e){
        console.error("Usuario no autenticado:", e);
    }
}

//LongOut 
export async function longOut() {
    await signOut(auth);
    sessionStorage.removeItem(COLLECTION_USER);
    window.location.href = "login.html"
}