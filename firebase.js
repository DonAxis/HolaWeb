// firebase.js
// Configuración de Firebase (versión compat)

const firebaseConfig = {
  apiKey: "AIzaSyCajdNO6U7xTRPD8xwy2hVoGqJX8506i2A",
  authDomain: "registrosescolares9.firebaseapp.com",
  projectId: "registrosescolares9",
  storageBucket: "registrosescolares9.firebasestorage.app",
  messagingSenderId: "1094486519116",
  appId: "1:1094486519116:web:ca9ecd75c5d56dc7b6f3e9",
  measurementId: "G-HJ8YJG8V3W"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a Firestore
const db = firebase.firestore();

console.log('Firebase conectado correctamente');