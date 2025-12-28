// MenuPersonas-firebase.js
// Sistema con Firebase en lugar de LocalStorage

let alumnosData = [];

// Inicializar: cargar datos desde Firebase
async function inicializar() {
  console.log(' Cargando datos desde Firebase...');
  await cargarDatosFirebase();
}

// Cargar datos desde Firebase
async function cargarDatosFirebase() {
  try {
    const snapshot = await db.collection('alumnos').orderBy('matricula').get();
    
    alumnosData = [];
    snapshot.forEach(doc => {
      alumnosData.push({
        docId: doc.id,  // ID de Firebase
        ...doc.data()   // Todos los datos del alumno
      });
    });
    
    console.log(` ${alumnosData.length} alumnos cargados desde Firebase`);
    mostrarTabla(alumnosData);
  } catch (error) {
    console.error(' Error al cargar datos:', error);
    document.getElementById("tabla-alumnos").innerHTML = 
      '<p style="color: red;">Error al cargar datos de Firebase. Verifica tu conexión.</p>';
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
    const grupo = `${alumno.grupoNum}${alumno.grupoSig}`;
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

  tabla += `
      </tbody>
    </table>
  `;
  
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
    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (docId === '') {
      // Agregar nuevo alumno
      await db.collection('alumnos').add(alumnoData);
      console.log(' Alumno agregado a Firebase');
      mostrarMensaje('Alumno agregado correctamente', 'exito');
    } else {
      // Actualizar alumno existente
      await db.collection('alumnos').doc(docId).update(alumnoData);
      console.log(' Alumno actualizado en Firebase');
      mostrarMensaje('Alumno actualizado correctamente', 'exito');
    }
    
    // Recargar datos
    await cargarDatosFirebase();
    cerrarModal();
  } catch (error) {
    console.error(' Error al guardar:', error);
    mostrarMensaje('Error al guardar: ' + error.message, 'error');
  }
}

// Eliminar alumno de Firebase
async function eliminarAlumno(index) {
  const alumno = alumnosData[index];
  
  if (confirm(`¿Estás seguro de eliminar a ${alumno.nombre}?`)) {
    try {
      await db.collection('alumnos').doc(alumno.docId).delete();
      console.log(' Alumno eliminado de Firebase');
      mostrarMensaje('Alumno eliminado correctamente', 'exito');
      
      // Recargar datos
      await cargarDatosFirebase();
    } catch (error) {
      console.error(' Error al eliminar:', error);
      mostrarMensaje('Error al eliminar: ' + error.message, 'error');
    }
  }
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('modalFormulario').style.display = 'none';
}

// Resetear datos (eliminar todo de Firebase)
async function resetearDatos() {
  if (confirm(' Esto eliminará TODOS los alumnos de Firebase. ¿Continuar?')) {
    try {
      const snapshot = await db.collection('alumnos').get();
      const batch = db.batch();
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('Todos los datos eliminados de Firebase');
      mostrarMensaje('Datos reseteados correctamente', 'exito');
      
      // Recargar datos (debería estar vacío)
      await cargarDatosFirebase();
    } catch (error) {
      console.error(' Error al resetear:', error);
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

// Inicializar cuando la página cargue
inicializar();