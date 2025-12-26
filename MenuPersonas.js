// personas-editable.js
// Sistema adaptado a la nueva estructura con grupos y actividades

let alumnosData = [];

// Al cargar la página, intentar obtener datos de localStorage primero
async function inicializar() {
  const datosGuardados = localStorage.getItem('personasData');
  
  if (datosGuardados) {
    console.log('📦 Cargando datos desde LocalStorage');
    alumnosData = JSON.parse(datosGuardados);
    mostrarTabla(alumnosData);
  } else {
    console.log('📥 Cargando datos desde JSON por primera vez');
    await cargarDatosJSON();
  }
}

// Cargar datos del JSON original
async function cargarDatosJSON() {
  try {
    const response = await fetch('personas.json');
    const data = await response.json();
    alumnosData = data.alumnos;
    
    guardarEnLocalStorage();
    mostrarTabla(alumnosData);
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    document.getElementById("tabla-alumnos").innerHTML = 
      '<p style="color: red;">Error al cargar los datos. Verifica que el archivo .json existe.</p>';
  }
}

// Guardar datos en localStorage
function guardarEnLocalStorage() {
  localStorage.setItem('personasData', JSON.stringify(alumnosData));
  console.log('💾 Datos guardados en LocalStorage');
}

// Mostrar la tabla con botones de acción
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
          <th>ID</th>
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
        <td>${alumno.id || "-"}</td>
        <td><strong>${alumno.nombre || "-"}</strong></td>
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

// Calcular promedio de las 3 actividades
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

  // Si todas son 0, mostrar "P" (pendiente)
  if (act1 === 0 && act2 === 0 && act3 === 0) {
    return "P";
  }

  return ((act1 + act2 + act3) / 3).toFixed(1);
}

// Mostrar formulario para agregar alumno
function mostrarFormularioAgregar() {
  document.getElementById('tituloModal').textContent = 'Agregar Nuevo Alumno';
  document.getElementById('indiceAlumno').value = '';
  
  // Limpiar formulario
  document.getElementById('formAlumno').reset();
  
  // Generar nuevo ID automáticamente
  const nuevoId = alumnosData.length > 0 
    ? Math.max(...alumnosData.map(a => parseInt(a.id) || 0)) + 1 
    : 1;
  document.getElementById('id').value = nuevoId;
  
  // Mostrar modal
  document.getElementById('modalFormulario').style.display = 'block';
}

// Editar alumno existente
function editarAlumno(index) {
  const alumno = alumnosData[index];
  
  document.getElementById('tituloModal').textContent = 'Editar Alumno';
  document.getElementById('indiceAlumno').value = index;
  
  // Llenar formulario con datos actuales
  document.getElementById('id').value = alumno.id || '';
  document.getElementById('nombre').value = alumno.nombre || '';
  document.getElementById('grupoNum').value = alumno.grupoNum || '';
  document.getElementById('grupoSig').value = alumno.grupoSig || '';
  document.getElementById('actividad1').value = alumno.actividad1 || '';
  document.getElementById('actividad2').value = alumno.actividad2 || '';
  document.getElementById('actividad3').value = alumno.actividad3 || '';
  
  // Mostrar modal
  document.getElementById('modalFormulario').style.display = 'block';
}

// Guardar alumno (crear o actualizar)
function guardarAlumno(event) {
  event.preventDefault();
  
  const index = document.getElementById('indiceAlumno').value;
  const nuevoAlumno = {
    id: document.getElementById('id').value,
    nombre: document.getElementById('nombre').value,
    grupoNum: document.getElementById('grupoNum').value,
    grupoSig: document.getElementById('grupoSig').value.toUpperCase(),
    actividad1: document.getElementById('actividad1').value,
    actividad2: document.getElementById('actividad2').value,
    actividad3: document.getElementById('actividad3').value
  };
  
  if (index === '') {
    // Agregar nuevo
    alumnosData.push(nuevoAlumno);
    console.log('➕ Alumno agregado');
    mostrarMensaje('Alumno agregado correctamente', 'exito');
  } else {
    // Actualizar existente
    alumnosData[index] = nuevoAlumno;
    console.log('✏️ Alumno actualizado');
    mostrarMensaje('Alumno actualizado correctamente', 'exito');
  }
  
  guardarEnLocalStorage();
  mostrarTabla(alumnosData);
  cerrarModal();
}

// Eliminar alumno
function eliminarAlumno(index) {
  const alumno = alumnosData[index];
  
  if (confirm(`¿Estás seguro de eliminar a ${alumno.nombre}?`)) {
    alumnosData.splice(index, 1);
    guardarEnLocalStorage();
    mostrarTabla(alumnosData);
    console.log('🗑️ Alumno eliminado');
    mostrarMensaje('Alumno eliminado correctamente', 'exito');
  }
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('modalFormulario').style.display = 'none';
}

// Resetear datos (volver al JSON original)
function resetearDatos() {
  if (confirm('⚠️ Esto borrará todos los cambios y volverá a los datos originales. ¿Continuar?')) {
    localStorage.removeItem('personasData');
    console.log('🔄 Datos reseteados');
    mostrarMensaje('Datos reseteados correctamente', 'exito');
    cargarDatosJSON();
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

// Inicializar al cargar la página
inicializar();