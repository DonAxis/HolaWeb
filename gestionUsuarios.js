// gestionUsuarios.js
// Sistema de Gestión de Usuarios para Admin

const auth = firebase.auth();
let usuariosData = [];
let carrerasData = [];
let filtroActual = 'todos';

// ===== PROTECCIÓN =====
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
    return;
  }

  try {
    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    
    if (!userDoc.exists || userDoc.data().rol !== 'admin') {
      alert('Solo administradores pueden acceder');
      window.location.href = 'login.html';
      return;
    }

    console.log('✅ Admin autorizado');
    await cargarCarreras();
    await cargarUsuarios();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al verificar permisos');
    window.location.href = 'login.html';
  }
});

// ===== CARGAR CARRERAS =====
async function cargarCarreras() {
  try {
    const snapshot = await db.collection('carreras').get();
    carrerasData = [];
    
    snapshot.forEach(doc => {
      carrerasData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${carrerasData.length} carreras cargadas`);
  } catch (error) {
    console.error('Error al cargar carreras:', error);
  }
}

// ===== CARGAR USUARIOS =====
async function cargarUsuarios() {
  try {
    const snapshot = await db.collection('usuarios').orderBy('nombre').get();
    usuariosData = [];
    
    snapshot.forEach(doc => {
      usuariosData.push({
        uid: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${usuariosData.length} usuarios cargados`);
    mostrarUsuarios();
    
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    document.getElementById('listaUsuarios').innerHTML = 
      '<p style="color: red; text-align: center;">Error al cargar usuarios</p>';
  }
}

// ===== MOSTRAR USUARIOS =====
function mostrarUsuarios() {
  const container = document.getElementById('listaUsuarios');
  
  // Filtrar usuarios según el filtro actual
  let usuariosFiltrados = usuariosData;
  if (filtroActual !== 'todos') {
    usuariosFiltrados = usuariosData.filter(u => u.rol === filtroActual);
  }
  
  if (usuariosFiltrados.length === 0) {
    container.innerHTML = '<div class="sin-usuarios">No hay usuarios registrados</div>';
    return;
  }
  
  let html = '';
  usuariosFiltrados.forEach(usuario => {
    const rolClass = `rol-${usuario.rol}`;
    const rolTexto = {
      'admin': '👑 Admin',
      'coordinador': '👨‍🏫 Coordinador',
      'profesor': '👩‍🏫 Profesor',
      'alumno': '👨‍🎓 Alumno'
    }[usuario.rol] || usuario.rol;
    
    // Buscar nombre de carrera si es coordinador
    let carreraInfo = '';
    if (usuario.rol === 'coordinador' && usuario.carreraId) {
      const carrera = carrerasData.find(c => c.id === usuario.carreraId);
      carreraInfo = carrera ? `<p>📚 ${carrera.nombre}</p>` : '<p>⚠️ Carrera no encontrada</p>';
    }
    
    // Mostrar matrícula si es alumno
    let matriculaInfo = '';
    if (usuario.rol === 'alumno' && usuario.matricula) {
      matriculaInfo = `<p>🎓 ${usuario.matricula}</p>`;
    }
    
    html += `
      <div class="usuario-card">
        <div class="usuario-info">
          <h3>${usuario.nombre}</h3>
          <p>📧 ${usuario.email}</p>
          ${carreraInfo}
          ${matriculaInfo}
          <p>
            <span class="rol-badge ${rolClass}">${rolTexto}</span>
            ${usuario.activo ? '<span style="color: #4caf50;">●</span> Activo' : '<span style="color: #f44336;">●</span> Inactivo'}
          </p>
        </div>
        <div class="usuario-acciones">
          <button onclick="editarUsuario('${usuario.uid}')" class="btn-editar">✏️ Editar</button>
          <button onclick="toggleActivo('${usuario.uid}', ${!usuario.activo})" 
                  class="botAzu" style="font-size: 0.9rem;">
            ${usuario.activo ? '🔒 Desactivar' : '🔓 Activar'}
          </button>
          <button onclick="eliminarUsuario('${usuario.uid}')" class="btn-eliminar">🗑️</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ===== FILTRAR POR ROL =====
function filtrarPorRol(rol) {
  filtroActual = rol;
  
  // Actualizar botones activos
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  mostrarUsuarios();
}

// ===== MOSTRAR FORMULARIO =====
function mostrarFormUsuario(rol) {
  document.getElementById('tituloModal').textContent = 
    `Crear Nuevo ${rol.charAt(0).toUpperCase() + rol.slice(1)}`;
  
  // Resetear formulario
  document.getElementById('formUsuario').reset();
  document.getElementById('usuarioId').value = '';
  document.getElementById('rolUsuario').value = rol;
  
  // Mostrar/ocultar campos según el rol
  document.getElementById('campoCarrera').style.display = 
    rol === 'coordinador' ? 'block' : 'none';
  document.getElementById('campoMatricula').style.display = 
    rol === 'alumno' ? 'block' : 'none';
  
  // Cargar carreras en el selector si es coordinador
  if (rol === 'coordinador') {
    const select = document.getElementById('carreraId');
    select.innerHTML = '<option value="">Seleccionar carrera...</option>';
    carrerasData.forEach(carrera => {
      select.innerHTML += `<option value="${carrera.id}">${carrera.nombre}</option>`;
    });
  }
  
  // Generar email y password sugeridos
  generarCredencialesSugeridas(rol);
  
  document.getElementById('modalFormulario').style.display = 'block';
}

// ===== GENERAR CREDENCIALES SUGERIDAS =====
function generarCredencialesSugeridas(rol) {
  const prefijos = {
    'admin': 'admin',
    'coordinador': 'coord',
    'profesor': 'prof',
    'alumno': 'alumno'
  };
  
  const random = Math.floor(Math.random() * 1000);
  const emailSugerido = `${prefijos[rol]}${random}@escuela.com`;
  const passwordSugerida = `Temp${random}!`;
  
  document.getElementById('email').placeholder = `Sugerido: ${emailSugerido}`;
  document.getElementById('password').placeholder = `Sugerido: ${passwordSugerida}`;
}

// ===== GUARDAR USUARIO =====
async function guardarUsuario(event) {
  event.preventDefault();
  
  const usuarioId = document.getElementById('usuarioId').value;
  const rol = document.getElementById('rolUsuario').value;
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const activo = document.getElementById('activo').checked;
  
  // Validar contraseña
  if (!usuarioId && password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  // Datos base del usuario
  const userData = {
    nombre: nombre,
    email: email,
    rol: rol,
    activo: activo,
    fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  // Agregar carreraId si es coordinador
  if (rol === 'coordinador') {
    const carreraId = document.getElementById('carreraId').value;
    if (!carreraId) {
      alert('Debes asignar una carrera al coordinador');
      return;
    }
    userData.carreraId = carreraId;
  }
  
  // Agregar matrícula si es alumno
  if (rol === 'alumno') {
    const matricula = document.getElementById('matricula').value.trim();
    if (!matricula) {
      alert('Debes proporcionar una matrícula');
      return;
    }
    userData.matricula = matricula;
  }
  
  try {
    if (usuarioId) {
      // EDITAR USUARIO EXISTENTE
      console.log('📝 Actualizando usuario...');
      
      // Actualizar solo en Firestore
      const updateData = { ...userData };
      delete updateData.fechaCreacion; // No actualizar fecha de creación
      
      await db.collection('usuarios').doc(usuarioId).update(updateData);
      
      // TODO: Si se cambió el password, actualizar en Authentication
      // Esto requeriría Cloud Functions o Admin SDK
      
      alert('✅ Usuario actualizado en Firestore\n\n⚠️ Si cambiaste el password, debes actualizarlo manualmente en Authentication');
      
    } else {
      // CREAR NUEVO USUARIO
      console.log('📝 Creando usuario en Authentication...');
      
      // Guardar el usuario actual admin
      const adminUser = auth.currentUser;
      
      // 1. Crear en Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const newUid = userCredential.user.uid;
      
      console.log('✅ Usuario creado en Auth. UID:', newUid);
      
      // 2. Guardar en Firestore
      await db.collection('usuarios').doc(newUid).set(userData);
      console.log('✅ Usuario guardado en Firestore');
      
      // 3. Cerrar sesión del usuario recién creado y restaurar admin
      await auth.signOut();
      await auth.signInWithEmailAndPassword(adminUser.email, prompt('Por seguridad, ingresa tu contraseña de admin para continuar:'));
      
      alert(`✅ Usuario creado exitosamente!\n\nEmail: ${email}\nPassword: ${password}\nUID: ${newUid}\n\nEl usuario ya puede hacer login.`);
    }
    
    cerrarModal();
    await cargarUsuarios();
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    let mensaje = 'Error al guardar usuario';
    
    switch(error.code) {
      case 'auth/email-already-in-use':
        mensaje = 'Este email ya está registrado en Authentication';
        break;
      case 'auth/invalid-email':
        mensaje = 'Email inválido';
        break;
      case 'auth/weak-password':
        mensaje = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/operation-not-allowed':
        mensaje = 'La creación de usuarios no está habilitada';
        break;
      default:
        mensaje = error.message;
    }
    
    alert('❌ ' + mensaje);
  }
}

// ===== EDITAR USUARIO =====
async function editarUsuario(uid) {
  const usuario = usuariosData.find(u => u.uid === uid);
  if (!usuario) return;
  
  document.getElementById('tituloModal').textContent = 'Editar Usuario';
  document.getElementById('usuarioId').value = uid;
  document.getElementById('rolUsuario').value = usuario.rol;
  document.getElementById('nombre').value = usuario.nombre;
  document.getElementById('email').value = usuario.email;
  document.getElementById('password').value = '';
  document.getElementById('password').placeholder = 'Dejar vacío para no cambiar';
  document.getElementById('activo').checked = usuario.activo;
  
  // Mostrar campos específicos
  if (usuario.rol === 'coordinador') {
    document.getElementById('campoCarrera').style.display = 'block';
    const select = document.getElementById('carreraId');
    select.innerHTML = '<option value="">Seleccionar carrera...</option>';
    carrerasData.forEach(carrera => {
      const selected = carrera.id === usuario.carreraId ? 'selected' : '';
      select.innerHTML += `<option value="${carrera.id}" ${selected}>${carrera.nombre}</option>`;
    });
  }
  
  if (usuario.rol === 'alumno') {
    document.getElementById('campoMatricula').style.display = 'block';
    document.getElementById('matricula').value = usuario.matricula || '';
  }
  
  document.getElementById('modalFormulario').style.display = 'block';
}

// ===== TOGGLE ACTIVO/INACTIVO =====
async function toggleActivo(uid, nuevoEstado) {
  try {
    await db.collection('usuarios').doc(uid).update({
      activo: nuevoEstado
    });
    
    alert(nuevoEstado ? 'Usuario activado' : 'Usuario desactivado');
    await cargarUsuarios();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar estado');
  }
}

// ===== ELIMINAR USUARIO =====
async function eliminarUsuario(uid) {
  const usuario = usuariosData.find(u => u.uid === uid);
  
  if (!confirm(`¿Eliminar a ${usuario.nombre}?\n\n⚠️ Esta acción NO eliminará el usuario de Authentication.\nDeberás eliminarlo manualmente allí también.`)) {
    return;
  }
  
  try {
    await db.collection('usuarios').doc(uid).delete();
    alert('Usuario eliminado de Firestore');
    await cargarUsuarios();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar');
  }
}

// ===== MODAL =====
function cerrarModal() {
  document.getElementById('modalFormulario').style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('modalFormulario');
  if (event.target === modal) {
    cerrarModal();
  }
}

console.log('👥 Sistema de Gestión de Usuarios cargado');