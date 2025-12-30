// login.js
// Sistema de autenticación con Firebase

const auth = firebase.auth();

// Manejar el formulario de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btnLogin = document.getElementById('btnLogin');
  const loading = document.getElementById('loading');
  
  // Mostrar loading
  btnLogin.disabled = true;
  loading.classList.add('active');
  limpiarMensaje();
  
  try {
    // 1. Autenticar con Firebase Auth
    console.log('🔐 Intentando login...');
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    console.log('✅ Usuario autenticado:', user.uid);
    
    // 2. Obtener datos del usuario desde Firestore
    console.log('📥 Obteniendo datos del usuario...');
    const userDoc = await db.collection('Usuarios').doc(user.uid).get();
    
    if (!userDoc.exists) {
      throw new Error('Usuario no encontrado en la base de datos');
    }
    
    const userData = userDoc.data();
    console.log('✅ Datos obtenidos:', userData);
    
    // 3. Verificar que el usuario está activo
    if (!userData.activo) {
      await auth.signOut();
      throw new Error('Tu cuenta está desactivada. Contacta al administrador');
    }
    
    // 4. Guardar datos en sessionStorage para usarlos en los dashboards
    sessionStorage.setItem('userId', user.uid);
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('userName', userData.nombre);
    sessionStorage.setItem('userRol', userData.rol);
    
    if (userData.carreraId) {
      sessionStorage.setItem('userCarreraId', userData.carreraId);
    }
    
    if (userData.matricula) {
      sessionStorage.setItem('userMatricula', userData.matricula);
    }
    
    console.log('💾 Datos guardados en sessionStorage');
    
    // 5. Mostrar mensaje de éxito
    mostrarMensaje(`¡Bienvenido, ${userData.nombre}!`, 'exito');
    
    // 6. Redirigir según el rol
    setTimeout(() => {
      redirigirSegunRol(userData.rol);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    
    // Mensajes de error amigables
    let mensajeError = 'Error al iniciar sesión';
    
    switch (error.code) {
      case 'auth/invalid-email':
        mensajeError = 'El correo electrónico no es válido';
        break;
      case 'auth/user-disabled':
        mensajeError = 'Esta cuenta ha sido deshabilitada';
        break;
      case 'auth/user-not-found':
        mensajeError = 'No existe una cuenta con este correo';
        break;
      case 'auth/wrong-password':
        mensajeError = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-credential':
        mensajeError = 'Correo o contraseña incorrectos';
        break;
      case 'auth/too-many-requests':
        mensajeError = 'Demasiados intentos fallidos. Intenta más tarde';
        break;
      case 'auth/network-request-failed':
        mensajeError = 'Error de conexión. Verifica tu internet';
        break;
      default:
        mensajeError = error.message;
    }
    
    mostrarMensaje(mensajeError, 'error');
    
    // Ocultar loading y habilitar botón
    btnLogin.disabled = false;
    loading.classList.remove('active');
  }
});

// Función para redirigir según el rol
function redirigirSegunRol(rol) {
  console.log('🚀 Redirigiendo a:', rol);
  
  switch (rol) {
    case 'admin':
      window.location.href = 'controlAdmin.html';
      break;
    case 'coordinador':
      window.location.href = 'dashboard-coordinador.html';
      break;
    case 'profesor':
      window.location.href = 'MenuPersonas.html';  // Tu página actual
      break;
    case 'alumno':
      window.location.href = 'dashboard-alumno.html';
      break;
    default:
      mostrarMensaje('Rol no reconocido. Contacta al administrador', 'error');
      setTimeout(() => {
        auth.signOut();
      }, 2000);
  }
}

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
  const mensajeDiv = document.getElementById('mensaje');
  mensajeDiv.innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;
}

// Función para limpiar mensajes
function limpiarMensaje() {
  document.getElementById('mensaje').innerHTML = '';
}

// Verificar si ya hay una sesión activa
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('👤 Usuario ya autenticado:', user.uid);
    
    try {
      // Obtener rol del usuario
      const userDoc = await db.collection('Usuarios').doc(user.uid).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Guardar en sessionStorage
        sessionStorage.setItem('userId', user.uid);
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userName', userData.nombre);
        sessionStorage.setItem('userRol', userData.rol);
        
        console.log('🔄 Redirigiendo usuario ya autenticado...');
        redirigirSegunRol(userData.rol);
      }
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
    }
  }
});

console.log('🔐 Sistema de login cargado');