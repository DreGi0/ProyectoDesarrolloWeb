  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
  import {getAuth} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAOiw2bW0RVmMa0YQ-1a9oSr-oQlXzj02s",
    authDomain: "grupo-musical-4df44.firebaseapp.com",
    projectId: "grupo-musical-4df44",
    storageBucket: "grupo-musical-4df44.firebasestorage.app",
    messagingSenderId: "459755918302",
    appId: "1:459755918302:web:08fceccea61b535442c34f",
    measurementId: "G-217PCNLL9K"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const auth = getAuth(app);
  export {auth, db};