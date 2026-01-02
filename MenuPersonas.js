// MenuPersonas.js - MIGRADO A FIREBASE
// Sistema con autenticación y Firebase

const auth = firebase.auth();
let alumnosData = [];
let usuarioActual = null;

// ===== PROTECCIÓN DE PÁGINA =====
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log('❌ No hay sesión activa');
    alert('Debes iniciar sesión para acceder');
    window.location.href = 'login.html';
    return;
  }

  // Verificar rol del usuario
  try {
    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ Usuario no encontrado en Firestore');
      await auth.signOut();
      window.location.href = 'login.html';
      return;
    }

    usuarioActual = userDoc.data();
    usuarioActual.uid = user.uid;

    // Verificar que tenga permiso (profesor o admin)
    if (usuarioActual.rol !== 'profesor' && usuarioActual.rol !== 'admin') {
      console.log('❌ No tienes permisos para acceder');
      alert('No tienes permisos para acceder a esta página');
      window.location.href = 'login.html';
      return;
    }

    console.log('✅ Usuario autorizado:', usuarioActual.nombre, '- Rol:', usuarioActual.rol);
    
    // Mostrar info del usuario en la página
    mostrarInfoUsuario();
    
    // Inicializar la aplicación
    inicializar();
    
  } catch (error) {
    console.error('❌ Error al verificar usuario:', error);
    alert('Error al verificar permisos');
    window.location.href = 'login.html';
  }
});

// Mostrar información del usuario en la página
function mostrarInfoUsuario() {
  const h1 = document.querySelector('h1');
  if (h1 && usuarioActual) {
    h1.innerHTML = `
      Registro Alumno
      <span style="float: right; font-size: 0.6em; color: #666;">
        👤 ${usuarioActual.nombre} (${usuarioActual.rol})
        <button onclick="cerrarSesion()" class="botAzu" style="margin-left: 10px;">🚪 Salir</button>
      </span>
    `;
  }
}

// Cerrar sesión
async function cerrarSesion() {
  if (confirm('¿Cerrar sesión?')) {
    try {
      await auth.signOut();
      sessionStorage.clear();
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  }
}

// ===== INICIALIZACIÓN CON FIREBASE =====
async function inicializar() {
  console.log('📥 Cargando datos desde Firebase...');
  await cargarDatosFirebase();
}

// Cargar datos desde Firebase
async function cargarDatosFirebase() {
  try {
    const snapshot = await db.collection('alumnos').orderBy('matricula').get();
    
    alumnosData = [];
    snapshot.forEach(doc => {
      alumnosData.push({
        docId: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${alumnosData.length} alumnos cargados desde Firebase`);
    mostrarTabla(alumnosData);
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    document.getElementById("tabla-alumnos").innerHTML = 
      '<p style="color: red;">Error al cargar datos de Firebase.</p>';
  }
}

// Mostrar tabla
function mostrarTabla(alumnos) {
  if (alumnos.length === 0) {
    document.getElementById("tabla-alumnos").innerHTML = 
      '<p style="color: #999; padding: 20px;">No hay alumnos registrados. ¡Agrega el primero!</p>';
    return;
  }

  let tabla = `
    <table>
      <thead>
        <tr>
          <th>Matrícula</th>
          <th>Nombre</th>
          <th>Grupo</th>
          <th>Actividad 1</th>
          <th>Actividad 2</th>
          <th>Actividad 3</th>
          <th style="background-color: #90caf9;">Promedio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

  alumnos.forEach((alumno, index) => {
    const grupo = `${alumno.grupoNum || ''}${alumno.grupoSig || ''}`;
    const promedio = calcularPromedio(alumno);
    
    tabla += `
      <tr>
        <td><strong>${alumno.matricula || "-"}</strong></td>
        <td>${alumno.nombre || "-"}</td>
        <td>${grupo || "-"}</td>
        <td>${alumno.actividad1 || "P"}</td>
        <td>${alumno.actividad2 || "P"}</td>
        <td>${alumno.actividad3 || "P"}</td>
        <td style="background-color: #90caf9;"><strong>${promedio}</strong></td>
        <td>
          <button onclick="editarAlumno(${index})" class="btn-editar">✏️ Editar</button>
          <button onclick="eliminarAlumno(${index})" class="btn-eliminar">🗑️</button>
        </td>
      </tr>
    `;
  });

  tabla += `</tbody></table>`;
  
  document.getElementById("tabla-alumnos").innerHTML = tabla;
}

// Calcular promedio
function calcularPromedio(alumno) {
  function nota(n) {
    if (typeof n === "string") {
      const num = parseFloat(n);
      return isNaN(num) ? 0 : num;
    }
    return Number(n) || 0;
  }

  const act1 = nota(alumno.actividad1);
  const act2 = nota(alumno.actividad2);
  const act3 = nota(alumno.actividad3);

  if (act1 === 0 && act2 === 0 && act3 === 0) {
    return "P";
  }

  return ((act1 + act2 + act3) / 3).toFixed(1);
}

// Mostrar formulario para agregar
function mostrarFormularioAgregar() {
  document.getElementById('tituloModal').textContent = 'Agregar Nuevo Alumno';
  document.getElementById('indiceAlumno').value = '';
  document.getElementById('docId').value = '';
  document.getElementById('formAlumno').reset();
  
  document.getElementById('modalFormulario').style.display = 'block';
}

// Editar alumno
function editarAlumno(index) {
  const alumno = alumnosData[index];
  
  document.getElementById('tituloModal').textContent = 'Editar Alumno';
  document.getElementById('indiceAlumno').value = index;
  document.getElementById('docId').value = alumno.docId;
  
  document.getElementById('matricula').value = alumno.matricula || '';
  document.getElementById('nombre').value = alumno.nombre || '';
  document.getElementById('grupoNum').value = alumno.grupoNum || '';
  document.getElementById('grupoSig').value = alumno.grupoSig || '';
  document.getElementById('actividad1').value = alumno.actividad1 || '';
  document.getElementById('actividad2').value = alumno.actividad2 || '';
  document.getElementById('actividad3').value = alumno.actividad3 || '';
  
  document.getElementById('modalFormulario').style.display = 'block';
}

// Guardar alumno en Firebase
async function guardarAlumno(event) {
  event.preventDefault();
  
  const docId = document.getElementById('docId').value;
  const alumnoData = {
    matricula: document.getElementById('matricula').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    grupoNum: document.getElementById('grupoNum').value,
    grupoSig: document.getElementById('grupoSig').value.toUpperCase(),
    actividad1: document.getElementById('actividad1').value,
    actividad2: document.getElementById('actividad2').value,
    actividad3: document.getElementById('actividad3').value,
    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
    actualizadoPor: usuarioActual.uid
  };
  
  try {
    if (docId === '') {
      await db.collection('alumnos').add(alumnoData);
      console.log('✅ Alumno agregado a Firebase');
      mostrarMensaje('Alumno agregado correctamente', 'exito');
    } else {
      await db.collection('alumnos').doc(docId).update(alumnoData);
      console.log('✅ Alumno actualizado en Firebase');
      mostrarMensaje('Alumno actualizado correctamente', 'exito');
    }
    
    await cargarDatosFirebase();
    cerrarModal();
  } catch (error) {
    console.error('❌ Error al guardar:', error);
    mostrarMensaje('Error al guardar: ' + error.message, 'error');
  }
}

// Eliminar alumno de Firebase
async function eliminarAlumno(index) {
  const alumno = alumnosData[index];
  
  if (confirm(`¿Estás seguro de eliminar a ${alumno.nombre}?`)) {
    try {
      await db.collection('alumnos').doc(alumno.docId).delete();
      console.log('✅ Alumno eliminado de Firebase');
      mostrarMensaje('Alumno eliminado correctamente', 'exito');
      
      await cargarDatosFirebase();
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      mostrarMensaje('Error al eliminar: ' + error.message, 'error');
    }
  }
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('modalFormulario').style.display = 'none';
}

// Resetear datos
async function resetearDatos() {
  if (confirm('⚠️ Esto eliminará TODOS los alumnos de Firebase. ¿Continuar?')) {
    try {
      const snapshot = await db.collection('alumnos').get();
      const batch = db.batch();
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('✅ Todos los datos eliminados');
      mostrarMensaje('Datos reseteados correctamente', 'exito');
      
      await cargarDatosFirebase();
    } catch (error) {
      console.error('❌ Error al resetear:', error);
      mostrarMensaje('Error al resetear: ' + error.message, 'error');
    }
  }
}

// Mostrar mensaje temporal
function mostrarMensaje(texto, tipo) {
  const contenedor = document.getElementById('contenido');
  const mensaje = document.createElement('div');
  mensaje.className = tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error';
  mensaje.textContent = texto;
  
  contenedor.insertBefore(mensaje, contenedor.firstChild);
  
  setTimeout(() => {
    mensaje.remove();
  }, 3000);
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
  const modal = document.getElementById('modalFormulario');
  if (event.target === modal) {
    cerrarModal();
  }
}

console.log('📱 MenuPersonas con Firebase cargado');