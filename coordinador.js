// coordinador.js
// Panel de Coordinador - Gestión Completa

const auth = firebase.auth();
let usuarioActual = null;
let carreraActual = null;

// ===== PROTECCIÓN Y AUTENTICACIÓN =====
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log('No hay sesión activa');
    //alert('Debes iniciar sesión');
    window.location.href = 'login.html';
    return;
  }

  try {
    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    
    if (!userDoc.exists) {
      console.log('Usuario no encontrado');
      await auth.signOut();
      window.location.href = 'login.html';
      return;
    }

    usuarioActual = userDoc.data();
    usuarioActual.uid = user.uid;

    // Verificar rol (coordinador o admin)
    if (usuarioActual.rol !== 'coordinador' && usuarioActual.rol !== 'admin') {
      console.log('No tienes permisos de coordinador');
      alert('No tienes permisos para acceder');
      window.location.href = 'login.html';
      return;
    }

    console.log('Coordinador autorizado:', usuarioActual.nombre);
    
    // Mostrar info del usuario
    document.getElementById('userName').textContent = usuarioActual.nombre;
    document.getElementById('userEmail').textContent = user.email;
    
    // Mostrar opción de carreras solo para admin
    if (usuarioActual.rol === 'admin') {
      document.getElementById('menuCarreras').style.display = 'block';
    }
    
    // Cargar carrera del coordinador
    await cargarCarrera();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al verificar permisos');
    window.location.href = 'login.html';
  }
});

// Cargar información de la carrera del coordinador
async function cargarCarrera() {
  if (usuarioActual.rol === 'admin') {
    document.getElementById('carreraInfo').textContent = 'Administrador - Todas las carreras';
    return;
  }

  if (!usuarioActual.carreraId) {
    document.getElementById('carreraInfo').textContent = 'Sin carrera asignada - Contacta al administrador';
    document.getElementById('carreraInfo').style.color = '#ff5252';
    
    // Deshabilitar acceso si no tiene carrera
    alert('No tienes una carrera asignada. Contacta al administrador.');
    return;
  }

  try {
    const carreraDoc = await db.collection('carreras').doc(usuarioActual.carreraId).get();
    if (carreraDoc.exists) {
      carreraActual = carreraDoc.data();
      carreraActual.id = carreraDoc.id;
      document.getElementById('carreraInfo').textContent = `Carrera: ${carreraActual.nombre}`;
    } else {
      document.getElementById('carreraInfo').textContent = 'Carrera no encontrada';
      document.getElementById('carreraInfo').style.color = '#ff5252';
    }
  } catch (error) {
    console.error('Error al cargar carrera:', error);
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
      console.error('Error:', error);
      alert('Error al cerrar sesión');
    }
  }
}

// ===== NAVEGACIÓN =====
function mostrarSeccion(seccion) {
  // Ocultar menú y todas las secciones
  document.getElementById('menuPrincipal').style.display = 'none';
  document.querySelectorAll('.seccion-contenido').forEach(s => s.classList.remove('active'));
  
  // Mostrar sección seleccionada
  const seccionId = `seccion${seccion.charAt(0).toUpperCase() + seccion.slice(1)}`;
  const elemento = document.getElementById(seccionId);
  if (elemento) {
    elemento.classList.add('active');
    
    // Cargar datos de la sección
    switch(seccion) {
      case 'carreras':
        cargarCarreras();
        break;
      case 'materias':
        cargarMaterias();
        break;
      case 'grupos':
        cargarGrupos();
        break;
      case 'profesores':
        cargarProfesores();
        break;
      case 'alumnos':
        cargarAlumnos();
        break;
      case 'asignaciones':
        cargarAsignaciones();
        break;
      case 'inscripciones':
        cargarInscripciones();
        break;
      case 'calificaciones':
        cargarMateriasCalificaciones();
        break;
      case 'periodos':
        cargarPeriodos();
        break;
    }
  }
}

function volverMenu() {
  document.querySelectorAll('.seccion-contenido').forEach(s => s.classList.remove('active'));
  document.getElementById('menuPrincipal').style.display = 'grid';
}

// ===== GESTIÓN DE CARRERAS =====
async function cargarCarreras() {
  // Solo admin puede ver carreras
  if (usuarioActual.rol !== 'admin') {
    const container = document.getElementById('listaCarreras');
    container.innerHTML = '<div class="sin-datos">No tienes permisos para gestionar carreras</div>';
    return;
  }
  
  try {
    const snapshot = await db.collection('carreras').get();
    const container = document.getElementById('listaCarreras');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay carreras registradas</div>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const carrera = doc.data();
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${carrera.nombre}</h4>
            <p>Código: ${carrera.codigo || 'N/A'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarCarrera('${doc.id}')" class="btn-editar">Editar</button>
            ${usuarioActual.rol === 'admin' ? `<button onclick="eliminarCarrera('${doc.id}')" class="btn-eliminar"></button>` : ''}
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar carreras');
  }
}

function mostrarFormCarrera(carreraId = null) {
  // Solo admin puede crear carreras
  if (usuarioActual.rol !== 'admin') {
    alert('Solo el administrador puede crear carreras');
    return;
  }
  
  const esEdicion = carreraId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Carrera' : 'Nueva Carrera';
  
  const html = `
    <form onsubmit="guardarCarrera(event, '${carreraId || ''}')">
      <div class="form-grupo">
        <label>Nombre de la Carrera:</label>
        <input type="text" id="nombreCarrera" required placeholder="Ej: Ingeniería en Software">
      </div>
      <div class="form-grupo">
        <label>Código:</label>
        <input type="text" id="codigoCarrera" required placeholder="Ej: ING" maxlength="10">
      </div>
      <div class="form-botones">
        <button type="submit" class="btn-guardar">Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  // Si es edición, cargar datos
  if (esEdicion) {
    cargarDatosCarrera(carreraId);
  }
}

async function cargarDatosCarrera(carreraId) {
  try {
    const doc = await db.collection('carreras').doc(carreraId).get();
    if (doc.exists) {
      const carrera = doc.data();
      document.getElementById('nombreCarrera').value = carrera.nombre;
      document.getElementById('codigoCarrera').value = carrera.codigo || '';
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function guardarCarrera(event, carreraId) {
  event.preventDefault();
  
  const data = {
    nombre: document.getElementById('nombreCarrera').value.trim(),
    codigo: document.getElementById('codigoCarrera').value.trim().toUpperCase(),
    activa: true,
    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (carreraId) {
      await db.collection('carreras').doc(carreraId).update(data);
      alert('Carrera actualizada');
    } else {
      await db.collection('carreras').add(data);
      alert('Carrera creada');
    }
    
    cerrarModal();
    cargarCarreras();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar');
  }
}

// ===== GESTIÓN DE MATERIAS =====
async function cargarMaterias() {
  try {
    let query = db.collection('materias');
    
    // Filtrar por carrera si es coordinador
    if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
      query = query.where('carreraId', '==', usuarioActual.carreraId);
    }
    
    const snapshot = await query.get();
    const container = document.getElementById('listaMaterias');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay materias registradas</div>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const materia = doc.data();
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${materia.nombre}</h4>
            <p>Grupo: ${materia.codigo} | Créditos: ${materia.creditos || 0} | Semestre: ${materia.semestre || 'N/A'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarMateria('${doc.id}')" class="btn-editar"> Editar</button>
            <button onclick="eliminarMateria('${doc.id}')" class="btn-eliminar"></button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar materias');
  }
}

function mostrarFormMateria(materiaId = null) {
  const esEdicion = materiaId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Materia' : 'Nueva Materia';
  
  const html = `
    <form onsubmit="guardarMateria(event, '${materiaId || ''}')">
      <div class="form-grupo">
        <label>Nombre de la Materia:</label>
        <input type="text" id="nombreMateria" required placeholder="Ej: Programación Web">
      </div>
      <div class="form-grupo">
        <label>Grupo:</label>
        <input type="text" id="codigoMateria" required placeholder="Ej: 3101LA">
      </div>
      <div class="form-grupo">
        <label>Créditos:</label>
        <input type="number" id="creditos" min="1" max="12" value="6">
      </div>
      <div class="form-grupo">
        <label>Semestre:</label>
        <input type="number" id="semestre" min="1" max="12" value="1">
      </div>
      <div class="form-botones">
        <button type="submit" class="btn-guardar">Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  if (esEdicion) {
    cargarDatosMateria(materiaId);
  }
}

async function cargarDatosMateria(materiaId) {
  try {
    const doc = await db.collection('materias').doc(materiaId).get();
    if (doc.exists) {
      const materia = doc.data();
      document.getElementById('nombreMateria').value = materia.nombre;
      document.getElementById('codigoMateria').value = materia.codigo;
      document.getElementById('creditos').value = materia.creditos || 6;
      document.getElementById('semestre').value = materia.semestre || 1;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function guardarMateria(event, materiaId) {
  event.preventDefault();
  
  const data = {
    nombre: document.getElementById('nombreMateria').value.trim(),
    codigo: document.getElementById('codigoMateria').value.trim().toUpperCase(),
    creditos: parseInt(document.getElementById('creditos').value),
    semestre: parseInt(document.getElementById('semestre').value),
    carreraId: usuarioActual.carreraId || null,
    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (materiaId) {
      await db.collection('materias').doc(materiaId).update(data);
      alert('Materia actualizada');
    } else {
      await db.collection('materias').add(data);
      alert('Materia creada');
    }
    
    cerrarModal();
    cargarMaterias();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar');
  }
}

// ===== GESTIÓN DE GRUPOS =====
async function cargarGrupos() {
  try {
    let query = db.collection('grupos');
    
    if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
      query = query.where('carreraId', '==', usuarioActual.carreraId);
    }
    
    const snapshot = await query.get();
    const container = document.getElementById('listaGrupos');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay grupos registrados</div>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const grupo = doc.data();
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${grupo.nombre}</h4>
            <p>Semestre: ${grupo.semestre} | Turno: ${grupo.turno || 'N/A'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarGrupo('${doc.id}')" class="btn-editar"> Editar</button>
            <button onclick="eliminarGrupo('${doc.id}')" class="btn-eliminar"></button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar grupos');
  }
}

function mostrarFormGrupo(grupoId = null) {
  const esEdicion = grupoId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Grupo' : 'Nuevo Grupo';
  
  const html = `
    <form onsubmit="guardarGrupo(event, '${grupoId || ''}')">
      <div class="form-grupo">
        <label>Nombre del Grupo (número y sigla):</label>
        <input type="text" id="nombreGrupo" required placeholder="1101SS">
      </div>
      <div class="form-grupo">
        <label>Semestre (número):</label>
        <input type="number" id="semestreGrupo" min="1" max="12" required placeholder="1">
      </div>
      <div class="form-grupo">
        <label>Turno:</label>
        <select id="turnoGrupo">
          <option value="Matutino">Matutino</option>
          <option value="Vespertino">Vespertino</option>
          <option value="Nocturno">Nocturno</option>
        </select>
      </div>
      <div class="form-botones">
        <button type="submit" class="btn-guardar">Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  if (esEdicion) {
    cargarDatosGrupo(grupoId);
  }
}

async function cargarDatosGrupo(grupoId) {
  try {
    const doc = await db.collection('grupos').doc(grupoId).get();
    if (doc.exists) {
      const grupo = doc.data();
      document.getElementById('nombreGrupo').value = grupo.nombre;
      document.getElementById('semestreGrupo').value = grupo.semestre;
      document.getElementById('turnoGrupo').value = grupo.turno || 'Matutino';
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function guardarGrupo(event, grupoId) {
  event.preventDefault();
  
  const data = {
    nombre: document.getElementById('nombreGrupo').value.trim(),
    semestre: parseInt(document.getElementById('semestreGrupo').value),
    turno: document.getElementById('turnoGrupo').value,
    carreraId: usuarioActual.carreraId || null,
    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    if (grupoId) {
      await db.collection('grupos').doc(grupoId).update(data);
      alert('Grupo actualizado');
    } else {
      await db.collection('grupos').add(data);
      alert('Grupo creado');
    }
    
    cerrarModal();
    cargarGrupos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar');
  }
}

// ===== ASIGNAR PROFESORES A MATERIAS =====
async function cargarAsignaciones() {
  try {
    // Cargar asignaciones activas
    let query = db.collection('profesorMaterias').where('activa', '==', true);
    
    // Filtrar por carrera si es coordinador
    if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
      query = query.where('carreraId', '==', usuarioActual.carreraId);
    }
    
    const snapshot = await query.get();
    const container = document.getElementById('listaAsignaciones');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay profesores asignados a materias</div>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const asignacion = doc.data();
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${asignacion.materiaNombre} (${asignacion.materiaCodigo})</h4>
            <p>Profesor: ${asignacion.profesorNombre}</p>
            <p>Grupo: ${asignacion.grupoNombre} | Periodo: ${asignacion.periodo}</p>
          </div>
          <div class="item-acciones">
            <button onclick="reasignarProfesor('${doc.id}')" class="btn-editar">Reasignar</button>
            <button onclick="desactivarAsignacion('${doc.id}')" class="btn-eliminar">Desactivar</button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error al cargar asignaciones:', error);
    document.getElementById('listaAsignaciones').innerHTML = 
      '<p style="color: red;">Error al cargar asignaciones</p>';
  }
}

async function mostrarFormAsignarProfesor() {
  document.getElementById('tituloModal').textContent = 'Asignar Profesor a Materia';
  
  // Cargar profesores de la carrera
  // Buscar profesores Y coordinadores que también sean profesores
  const profesoresSnap = await db.collection('usuarios')
    .where('carreras', 'array-contains', usuarioActual.carreraId)
    .get();
  
  // Filtrar solo profesores y coordinadores con esProfesor: true
  const profesoresValidos = [];
  profesoresSnap.forEach(doc => {
    const data = doc.data();
    if (data.rol === 'profesor' || (data.rol === 'coordinador' && data.esProfesor === true)) {
      profesoresValidos.push({ id: doc.id, ...data });
    }
  });
  let profesoresHtml = '<option value="">Seleccionar profesor...</option>';
  profesoresSnap.forEach(doc => {
    const prof = doc.data();
    profesoresHtml += `<option value="${doc.id}" data-nombre="${prof.nombre}">${prof.nombre} (${prof.email})</option>`;
  });
  
  // Cargar materias de la carrera
  let materiasQuery = db.collection('materias');
  if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
    materiasQuery = materiasQuery.where('carreraId', '==', usuarioActual.carreraId);
  }
  const materiasSnap = await materiasQuery.get();
  let materiasHtml = '<option value="">Seleccionar materia...</option>';
  materiasSnap.forEach(doc => {
    const mat = doc.data();
    materiasHtml += `<option value="${doc.id}" data-nombre="${mat.nombre}" data-codigo="${mat.codigo}">${mat.nombre} (${mat.codigo})</option>`;
  });
  
  // Cargar grupos de la carrera
  let gruposQuery = db.collection('grupos');
  if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
    gruposQuery = gruposQuery.where('carreraId', '==', usuarioActual.carreraId);
  }
  const gruposSnap = await gruposQuery.get();
  let gruposHtml = '<option value="">Seleccionar grupo...</option>';
  gruposSnap.forEach(doc => {
    const grp = doc.data();
    gruposHtml += `<option value="${doc.id}" data-nombre="${grp.nombre}">${grp.nombre} (Semestre ${grp.semestre})</option>`;
  });
  
  const html = `
    <form onsubmit="guardarAsignacionProfesor(event)">
      <div class="form-grupo">
        <label>Materia: *</label>
        <select id="materiaAsignar" required>
          ${materiasHtml}
        </select>
      </div>
      
      <div class="form-grupo">
        <label>Profesor: *</label>
        <select id="profesorAsignar" required>
          ${profesoresHtml}
        </select>
      </div>
      
      <div class="form-grupo">
        <label>Grupo: *</label>
        <select id="grupoAsignar" required>
          ${gruposHtml}
        </select>
      </div>
      
      <div class="form-grupo">
        <label>Periodo: *</label>
        <input type="text" id="periodoAsignar" required placeholder="Ej: 2026-1" value="2026-1">
        <small style="color: #666;">Formato: AÑO-SEMESTRE (ej: 2026-1)</small>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar"> Asignar Profesor</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar"> Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
}

async function guardarAsignacionProfesor(event) {
  event.preventDefault();
  
  const materiaSelect = document.getElementById('materiaAsignar');
  const profesorSelect = document.getElementById('profesorAsignar');
  const grupoSelect = document.getElementById('grupoAsignar');
  
  const materiaId = materiaSelect.value;
  const materiaNombre = materiaSelect.options[materiaSelect.selectedIndex].dataset.nombre;
  const materiaCodigo = materiaSelect.options[materiaSelect.selectedIndex].dataset.codigo;
  
  const profesorId = profesorSelect.value;
  const profesorNombre = profesorSelect.options[profesorSelect.selectedIndex].dataset.nombre;
  
  const grupoId = grupoSelect.value;
  const grupoNombre = grupoSelect.options[grupoSelect.selectedIndex].dataset.nombre;
  
  const periodo = document.getElementById('periodoAsignar').value.trim();
  
  // Verificar si ya existe esta asignación activa
  const existe = await db.collection('profesorMaterias')
    .where('materiaId', '==', materiaId)
    .where('grupoId', '==', grupoId)
    .where('periodo', '==', periodo)
    .where('activa', '==', true)
    .get();
  
  if (!existe.empty) {
    if (!confirm('Ya existe un profesor asignado a esta materia y grupo en este periodo.\n¿Deseas desactivar la asignación anterior y crear una nueva?')) {
      return;
    }
    
    // Desactivar asignaciones anteriores
    const batch = db.batch();
    existe.forEach(doc => {
      batch.update(doc.ref, { 
        activa: false,
        fechaFin: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();
  }
  
  // Crear nueva asignación
  const asignacion = {
    materiaId: materiaId,
    materiaNombre: materiaNombre,
    materiaCodigo: materiaCodigo,
    profesorId: profesorId,
    profesorNombre: profesorNombre,
    grupoId: grupoId,
    grupoNombre: grupoNombre,
    carreraId: usuarioActual.carreraId || null,
    periodo: periodo,
    activa: true,
    fechaAsignacion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('profesorMaterias').add(asignacion);
    alert('Profesor asignado correctamente');
    cerrarModal();
    cargarAsignaciones();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al asignar profesor');
  }
}

async function desactivarAsignacion(asignacionId) {
  if (!confirm('¿Desactivar esta asignación?\n\nEl profesor ya no aparecerá como responsable de esta materia.')) {
    return;
  }
  
  try {
    await db.collection('profesorMaterias').doc(asignacionId).update({
      activa: false,
      fechaFin: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert('Asignación desactivada');
    cargarAsignaciones();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al desactivar');
  }
}

async function reasignarProfesor(asignacionId) {
  // Obtener datos de la asignación actual
  const asignDoc = await db.collection('profesorMaterias').doc(asignacionId).get();
  const asignActual = asignDoc.data();
  
  if (!confirm(`Reasignar profesor para:\n\nMateria: ${asignActual.materiaNombre}\nGrupo: ${asignActual.grupoNombre}\nProfesor actual: ${asignActual.profesorNombre}\n\n¿Continuar?`)) {
    return;
  }
  
  // Desactivar asignación actual
  await db.collection('profesorMaterias').doc(asignacionId).update({
    activa: false,
    fechaFin: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  // Mostrar formulario para nueva asignación
  mostrarFormAsignarProfesor();
}

// ===== INSCRIBIR ALUMNOS A MATERIAS =====
async function cargarInscripciones() {
  try {
    // Cargar inscripciones activas
    let query = db.collection('alumnoMaterias').where('inscrito', '==', true);
    
    // Filtrar por carrera si es coordinador
    if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
      query = query.where('carreraId', '==', usuarioActual.carreraId);
    }
    
    const snapshot = await query.get();
    const container = document.getElementById('listaInscripciones');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay alumnos inscritos a materias</div>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const inscripcion = doc.data();
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${inscripcion.alumnoNombre} (${inscripcion.alumnoMatricula})</h4>
            <p>Materia: ${inscripcion.materiaNombre}</p>
            <p>Grupo: ${inscripcion.grupoNombre} | Periodo: ${inscripcion.periodo}</p>
          </div>
          <div class="item-acciones">
            <button onclick="darDeBajaAlumno('${doc.id}')" class="btn-eliminar">Dar de Baja</button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error al cargar inscripciones:', error);
    document.getElementById('listaInscripciones').innerHTML = 
      '<p style="color: red;">Error al cargar inscripciones</p>';
  }
}

async function mostrarFormInscribirAlumno() {
  document.getElementById('tituloModal').textContent = 'Inscribir Alumno a Materia';
  
  // Cargar alumnos
  const alumnosSnap = await db.collection('usuarios').where('rol', '==', 'alumno').get();
  let alumnosHtml = '<option value="">Seleccionar alumno...</option>';
  alumnosSnap.forEach(doc => {
    const alum = doc.data();
    alumnosHtml += `<option value="${doc.id}" data-nombre="${alum.nombre}" data-matricula="${alum.matricula}">${alum.nombre} (${alum.matricula})</option>`;
  });
  
  // Cargar materias de la carrera
  let materiasQuery = db.collection('materias');
  if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
    materiasQuery = materiasQuery.where('carreraId', '==', usuarioActual.carreraId);
  }
  const materiasSnap = await materiasQuery.get();
  let materiasHtml = '<option value="">Seleccionar materia...</option>';
  materiasSnap.forEach(doc => {
    const mat = doc.data();
    materiasHtml += `<option value="${doc.id}" data-nombre="${mat.nombre}" data-codigo="${mat.codigo}">${mat.nombre} (${mat.codigo})</option>`;
  });
  
  // Cargar grupos de la carrera
  let gruposQuery = db.collection('grupos');
  if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
    gruposQuery = gruposQuery.where('carreraId', '==', usuarioActual.carreraId);
  }
  const gruposSnap = await gruposQuery.get();
  let gruposHtml = '<option value="">Seleccionar grupo...</option>';
  gruposSnap.forEach(doc => {
    const grp = doc.data();
    gruposHtml += `<option value="${doc.id}" data-nombre="${grp.nombre}">${grp.nombre} (Semestre ${grp.semestre})</option>`;
  });
  
  const html = `
    <form onsubmit="guardarInscripcionAlumno(event)">
      <div class="form-grupo">
        <label>Alumno: *</label>
        <select id="alumnoInscribir" required>
          ${alumnosHtml}
        </select>
      </div>
      
      <div class="form-grupo">
        <label>Materia: *</label>
        <select id="materiaInscribir" required>
          ${materiasHtml}
        </select>
      </div>
      
      <div class="form-grupo">
        <label>Grupo: *</label>
        <select id="grupoInscribir" required>
          ${gruposHtml}
        </select>
      </div>
      
      <div class="form-grupo">
        <label>Periodo: *</label>
        <input type="text" id="periodoInscribir" required placeholder="Ej: 2026-1" value="2026-1">
        <small style="color: #666;">Formato: AÑO-SEMESTRE (ej: 2026-1)</small>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar"> Inscribir Alumno</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar"> Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
}

async function guardarInscripcionAlumno(event) {
  event.preventDefault();
  
  const alumnoSelect = document.getElementById('alumnoInscribir');
  const materiaSelect = document.getElementById('materiaInscribir');
  const grupoSelect = document.getElementById('grupoInscribir');
  
  const alumnoId = alumnoSelect.value;
  const alumnoNombre = alumnoSelect.options[alumnoSelect.selectedIndex].dataset.nombre;
  const alumnoMatricula = alumnoSelect.options[alumnoSelect.selectedIndex].dataset.matricula;
  
  const materiaId = materiaSelect.value;
  const materiaNombre = materiaSelect.options[materiaSelect.selectedIndex].dataset.nombre;
  const materiaCodigo = materiaSelect.options[materiaSelect.selectedIndex].dataset.codigo;
  
  const grupoId = grupoSelect.value;
  const grupoNombre = grupoSelect.options[grupoSelect.selectedIndex].dataset.nombre;
  
  const periodo = document.getElementById('periodoInscribir').value.trim();
  
  // Verificar si ya está inscrito
  const existe = await db.collection('alumnoMaterias')
    .where('alumnoId', '==', alumnoId)
    .where('materiaId', '==', materiaId)
    .where('grupoId', '==', grupoId)
    .where('periodo', '==', periodo)
    .where('inscrito', '==', true)
    .get();
  
  if (!existe.empty) {
    alert('Este alumno ya está inscrito en esta materia y grupo');
    return;
  }
  
  // Crear inscripción
  const inscripcion = {
    alumnoId: alumnoId,
    alumnoNombre: alumnoNombre,
    alumnoMatricula: alumnoMatricula,
    materiaId: materiaId,
    materiaNombre: materiaNombre,
    materiaCodigo: materiaCodigo,
    grupoId: grupoId,
    grupoNombre: grupoNombre,
    carreraId: usuarioActual.carreraId || null,
    periodo: periodo,
    inscrito: true,
    fechaInscripcion: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    await db.collection('alumnoMaterias').add(inscripcion);
    alert('Alumno inscrito correctamente');
    cerrarModal();
    cargarInscripciones();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al inscribir alumno');
  }
}

async function darDeBajaAlumno(inscripcionId) {
  if (!confirm('¿Dar de baja a este alumno de la materia?')) {
    return;
  }
  
  try {
    await db.collection('alumnoMaterias').doc(inscripcionId).update({
      inscrito: false,
      fechaBaja: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert('Alumno dado de baja');
    cargarInscripciones();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al dar de baja');
  }
}

// ===== GESTIÓN DE PROFESORES (CREAR/EDITAR) =====
async function cargarProfesores() {
  try {
    // Filtrar profesores por carrera del coordinador
    const snapshot = await db.collection('usuarios')
      .where('rol', '==', 'profesor')
      .where('carreras', 'array-contains', usuarioActual.carreraId)
      .get();
    const container = document.getElementById('listaProfesores');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay profesores registrados</div>';
      return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
      const profesor = doc.data();
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${profesor.nombre}</h4>
            <p>${profesor.email}</p>
            <p>${profesor.activo ? '<span style="color: #4caf50;">●</span> Activo' : '<span style="color: #f44336;">●</span> Inactivo'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarProfesor('${doc.id}')" class="btn-editar">Editar</button>
            <button onclick="toggleActivoUsuario('${doc.id}', 'profesor', ${!profesor.activo})" class="botAzu">
              ${profesor.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar profesores');
  }
}

function mostrarFormProfesor(profesorId = null) {
  const esEdicion = profesorId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Profesor' : 'Nuevo Profesor';
  
  const html = `
    <form onsubmit="guardarProfesor(event, '${profesorId || ''}')">
      <div class="form-grupo">
        <label>Nombre Completo: *</label>
        <input type="text" id="nombreProfesor" required placeholder="Nombre completo">
      </div>
      
      <div class="form-grupo">
        <label>Email: *</label>
        <input type="email" id="emailProfesor" required placeholder="profesor@escuela.com">
      </div>
      
      ${!esEdicion ? `
        <div class="form-grupo">
          <label>Contraseña Temporal: *</label>
          <input type="text" id="passwordProfesor" required placeholder="Mínimo 6 caracteres" value="Profesor123!">
          <small style="color: #666;">El profesor podrá cambiarla después</small>
        </div>
      ` : ''}
      
      <div class="form-grupo">
        <label>
          <input type="checkbox" id="activoProfesor" checked>
          Profesor activo
        </label>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar">Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  if (esEdicion) {
    cargarDatosProfesor(profesorId);
  }
}

async function cargarDatosProfesor(profesorId) {
  try {
    const doc = await db.collection('usuarios').doc(profesorId).get();
    if (doc.exists) {
      const profesor = doc.data();
      document.getElementById('nombreProfesor').value = profesor.nombre;
      document.getElementById('emailProfesor').value = profesor.email;
      document.getElementById('activoProfesor').checked = profesor.activo;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function guardarProfesor(event, profesorId) {
  event.preventDefault();
  
  const nombre = document.getElementById('nombreProfesor').value.trim();
  const email = document.getElementById('emailProfesor').value.trim();
  const activo = document.getElementById('activoProfesor').checked;
  
  const userData = {
    nombre: nombre,
    email: email,
    rol: 'profesor',
    activo: activo
  };
  
  try {
    if (profesorId) {
      // Editar
      await db.collection('usuarios').doc(profesorId).update(userData);
      alert('Profesor actualizado');
    } else {
      // Crear nuevo
      const password = document.getElementById('passwordProfesor').value;
      
      if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      // Guardar usuario admin actual
      const adminUser = auth.currentUser;
      
      try {
        // Crear en Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUid = userCredential.user.uid;
        
        // Guardar en Firestore CON carreras
        userData.carreras = [usuarioActual.carreraId];
        userData.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
        
        console.log('Guardando profesor en Firestore...', newUid);
        await db.collection('usuarios').doc(newUid).set(userData);
        console.log('Profesor guardado en Firestore');
        
        // Guardar info del coordinador para re-login automático
        sessionStorage.setItem('returnToCoord', 'true');
        sessionStorage.setItem('coordEmail', usuarioActual.email);
        
        // Usuario creado - redirigir a login
        await auth.signOut();
        alert(`Profesor creado exitosamente\n\nNombre: ${nombre}\nEmail: ${email}\nPassword: ${password}\n\nDebes iniciar sesión de nuevo como coordinador.`);
        window.location.href = 'login.html';
        return;
        
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          // Email ya existe - buscar profesor y agregar carrera
          const existeSnap = await db.collection('usuarios')
            .where('email', '==', email)
            .where('rol', '==', 'profesor')
            .limit(1)
            .get();
          
          if (!existeSnap.empty) {
            const profesorDoc = existeSnap.docs[0];
            const profesorData = profesorDoc.data();
            const carrerasActuales = profesorData.carreras || [];
            
            if (!carrerasActuales.includes(usuarioActual.carreraId)) {
              await db.collection('usuarios').doc(profesorDoc.id).update({
                carreras: [...carrerasActuales, usuarioActual.carreraId]
              });
              alert(`Profesor ya existía en otra carrera.\n\nSe agregó a tu carrera exitosamente.\n\nIMPORTANTE:\nEl profesor mantiene su contraseña original.\nLa contraseña que ingresaste NO se aplicó.\n\nNombre: ${profesorData.nombre}\nEmail: ${email}`);
            } else {
              alert(`Este profesor ya está en tu carrera.\n\nNombre: ${profesorData.nombre}`);
            }
            
            cerrarModal();
            cargarProfesores();
            return;
          }
        }
        throw authError;
      }
    }
    
    cerrarModal();
    cargarProfesores();
  } catch (error) {
    console.error('Error:', error);
    
    let mensaje = 'Error al guardar profesor';
    if (error.code === 'auth/email-already-in-use') {
      mensaje = 'Este email ya está registrado (pero no como profesor)';
    } else if (error.code === 'auth/invalid-email') {
      mensaje = 'Email inválido';
    } else if (error.code === 'auth/weak-password') {
      mensaje = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    alert(mensaje);
  }
}

function editarProfesor(profesorId) {
  mostrarFormProfesor(profesorId);
}

// ===== GESTIÓN DE ALUMNOS (CREAR/EDITAR) =====
async function cargarAlumnos() {
  try {
    // Filtrar alumnos por carrera del coordinador
    const snapshot = await db.collection('usuarios')
      .where('rol', '==', 'alumno')
      .where('carreraId', '==', usuarioActual.carreraId)
      .get();
    const container = document.getElementById('listaAlumnos');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay alumnos registrados</div>';
      return;
    }
    
    // Cargar todos los grupos para mapear nombres
    const gruposSnap = await db.collection('grupos').get();
    const gruposMap = {};
    gruposSnap.forEach(doc => {
      gruposMap[doc.id] = doc.data().nombre;
    });
    
    let html = '';
    snapshot.forEach(doc => {
      const alumno = doc.data();
      const grupoNombre = alumno.grupoId ? (gruposMap[alumno.grupoId] || 'Grupo no encontrado') : 'Sin grupo';
      
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${alumno.nombre}</h4>
            <p>Matrícula: ${alumno.matricula || 'N/A'}</p>
            <p>Grupo: ${grupoNombre}</p>
            <p>${alumno.email}</p>
            <p>${alumno.activo ? '<span style="color: #4caf50;">●</span> Activo' : '<span style="color: #f44336;">●</span> Inactivo'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarAlumno('${doc.id}')" class="btn-editar">Editar</button>
            <button onclick="toggleActivoUsuario('${doc.id}', 'alumno', ${!alumno.activo})" class="botAzu">
              ${alumno.activo ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar alumnos');
  }
}

async function mostrarFormAlumno(alumnoId = null) {
  const esEdicion = alumnoId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Alumno' : 'Nuevo Alumno';
  
  // Cargar grupos de la carrera del coordinador
  let gruposHtml = '<option value="">Sin grupo asignado</option>';
  try {
    const gruposSnap = await db.collection('grupos')
      .where('carreraId', '==', usuarioActual.carreraId)
      .get();
    
    gruposSnap.forEach(doc => {
      const grupo = doc.data();
      gruposHtml += `<option value="${doc.id}">${grupo.nombre} (Semestre ${grupo.semestre})</option>`;
    });
  } catch (error) {
    console.error('Error al cargar grupos:', error);
  }
  
  const html = `
    <form onsubmit="guardarAlumno(event, '${alumnoId || ''}')">
      <div class="form-grupo">
        <label>Nombre Completo: *</label>
        <input type="text" id="nombreAlumno" required placeholder="Nombre completo">
      </div>
      
      <div class="form-grupo">
        <label>Matrícula: *</label>
        <input type="text" id="matriculaAlumno" required placeholder="Ej: 2024001">
      </div>
      
      <div class="form-grupo">
        <label>Email: *</label>
        <input type="email" id="emailAlumno" required placeholder="alumno@escuela.com">
      </div>
      
      <div class="form-grupo">
        <label>Grupo: *</label>
        <select id="grupoAlumno" required>
          ${gruposHtml}
        </select>
        <small style="color: #666;">El grupo determina las materias del alumno</small>
      </div>
      
      <div class="form-grupo">
        <label>
          <input type="checkbox" id="activoAlumno" checked>
          Alumno activo
        </label>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar">Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  if (esEdicion) {
    cargarDatosAlumno(alumnoId);
  }
}

async function cargarDatosAlumno(alumnoId) {
  try {
    const doc = await db.collection('usuarios').doc(alumnoId).get();
    if (doc.exists) {
      const alumno = doc.data();
      document.getElementById('nombreAlumno').value = alumno.nombre;
      document.getElementById('matriculaAlumno').value = alumno.matricula || '';
      document.getElementById('emailAlumno').value = alumno.email;
      document.getElementById('grupoAlumno').value = alumno.grupoId || '';
      document.getElementById('activoAlumno').checked = alumno.activo;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function guardarAlumno(event, alumnoId) {
  event.preventDefault();
  
  const nombre = document.getElementById('nombreAlumno').value.trim();
  const matricula = document.getElementById('matriculaAlumno').value.trim();
  const email = document.getElementById('emailAlumno').value.trim();
  const grupoId = document.getElementById('grupoAlumno').value;
  const activo = document.getElementById('activoAlumno').checked;
  
  const userData = {
    nombre: nombre,
    matricula: matricula,
    email: email.toLowerCase(),
    rol: 'alumno',
    grupoId: grupoId || null,
    carreraId: usuarioActual.carreraId,
    activo: activo
  };
  
  try {
    if (alumnoId) {
      // Editar
      await db.collection('usuarios').doc(alumnoId).update(userData);
      alert('Alumno actualizado');
    } else {
      // Crear nuevo - SOLO en Firestore (sin Authentication)
      userData.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('usuarios').add(userData);
      
      alert(`Alumno registrado!\n\nNombre: ${nombre}\nMatrícula: ${matricula}\nEmail: ${email}\n\nEl alumno puede consultar en:\nControlAlumno.html`);
    }
    
    cerrarModal();
    cargarAlumnos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar alumno');
  }
}

function editarAlumno(alumnoId) {
  mostrarFormAlumno(alumnoId);
}

// Función auxiliar para activar/desactivar usuarios
async function toggleActivoUsuario(userId, tipo, nuevoEstado) {
  try {
    await db.collection('usuarios').doc(userId).update({
      activo: nuevoEstado
    });
    
    alert(nuevoEstado ? `${tipo} activado` : `${tipo} desactivado`);
    
    if (tipo === 'profesor') {
      cargarProfesores();
    } else if (tipo === 'alumno') {
      cargarAlumnos();
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar estado');
  }
}

// ===== FUNCIONES DE ELIMINACIÓN =====
async function eliminarCarrera(id) {
  if (usuarioActual.rol !== 'admin') {
    alert('Solo el administrador puede eliminar carreras');
    return;
  }
  
  if (confirm('¿Eliminar esta carrera?')) {
    try {
      await db.collection('carreras').doc(id).delete();
      alert('Carrera eliminada');
      cargarCarreras();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  }
}

async function eliminarMateria(id) {
  if (confirm('¿Eliminar esta materia?')) {
    try {
      await db.collection('materias').doc(id).delete();
      alert('Materia eliminada');
      cargarMaterias();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  }
}

async function eliminarGrupo(id) {
  if (confirm('¿Eliminar este grupo?')) {
    try {
      await db.collection('grupos').doc(id).delete();
      alert('Grupo eliminado');
      cargarGrupos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar');
    }
  }
}

function editarCarrera(id) {
  mostrarFormCarrera(id);
}

function editarMateria(id) {
  mostrarFormMateria(id);
}

function editarGrupo(id) {
  mostrarFormGrupo(id);
}

// ===== MODAL =====
function cerrarModal() {
  document.getElementById('modalGenerico').style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('modalGenerico');
  if (event.target === modal) {
    cerrarModal();
  }
}

console.log('Panel de Coordinador cargado');

// ===== SISTEMA DE MODOS (COORDINADOR / PROFESOR) =====
function cambiarModo(modo) {
  const tabCoord = document.getElementById('tabCoordinador');
  const tabProf = document.getElementById('tabProfesor');
  const modoCoord = document.getElementById('modoCoordinador');
  const modoProf = document.getElementById('modoProfesor');
  
  if (modo === 'coordinador') {
    // Activar modo coordinador
    tabCoord.style.background = 'white';
    tabCoord.style.color = '#667eea';
    tabCoord.style.borderBottom = '3px solid #667eea';
    
    tabProf.style.background = 'rgba(255,255,255,0.2)';
    tabProf.style.color = 'white';
    tabProf.style.borderBottom = '3px solid transparent';
    
    modoCoord.style.display = 'block';
    modoProf.style.display = 'none';
    
  } else if (modo === 'profesor') {
    // Redirigir a ControlProfe.html
    window.location.href = 'controlProfe.html';
  }
}


// ===== GESTIÓN DE CALIFICACIONES (COORDINADOR) =====

let asignacionCalifActual = null;
let alumnosCalifMateria = [];

// Cargar materias en el selector
async function cargarMateriasCalificaciones() {
  try {
    const select = document.getElementById('selectMateriaCalif');
    if (!select) return;
    
    select.innerHTML = '<option value="">Cargando materias...</option>';
    
    console.log('Buscando asignaciones para carrera:', usuarioActual.carreraId);
    
    // Buscar asignaciones de la carrera
    const snapshot = await db.collection('profesorMaterias')
      .where('carreraId', '==', usuarioActual.carreraId)
      .where('activa', '==', true)
      .get();
    
    console.log('Asignaciones encontradas:', snapshot.size);
    
    if (snapshot.empty) {
      select.innerHTML = '<option value="">No hay materias asignadas</option>';
      alert('No hay materias asignadas en tu carrera.\n\nDebes primero:\n1. Crear grupos\n2. Asignar profesores a materias\n3. Luego podrás gestionar calificaciones');
      return;
    }
    
    select.innerHTML = '<option value="">Seleccionar materia...</option>';
    
    snapshot.forEach(doc => {
      const asig = doc.data();
      select.innerHTML += `<option value="${doc.id}">${asig.materiaNombre} - ${asig.grupoNombre} (${asig.profesorNombre})</option>`;
    });
    
  } catch (error) {
    console.error('Error al cargar materias:', error);
    alert('Error al cargar materias: ' + error.message);
  }
}

// Cargar calificaciones de una materia
async function cargarCalificacionesMateria() {
  try {
    const selectMat = document.getElementById('selectMateriaCalif');
    const asignacionId = selectMat.value;
    
    if (!asignacionId) {
      document.getElementById('contenedorCalificaciones').style.display = 'none';
      return;
    }
    
    // Cargar asignación
    const asigDoc = await db.collection('profesorMaterias').doc(asignacionId).get();
    if (!asigDoc.exists) {
      alert('Asignación no encontrada');
      return;
    }
    
    asignacionCalifActual = { id: asignacionId, ...asigDoc.data() };
    
    // Mostrar info
    document.getElementById('tituloMateriaCalif').textContent = asignacionCalifActual.materiaNombre;
    document.getElementById('infoMateriaCalif').textContent = 
      `Grupo: ${asignacionCalifActual.grupoNombre} | Profesor: ${asignacionCalifActual.profesorNombre} | Periodo: ${asignacionCalifActual.periodo}`;
    
    // Cargar alumnos del grupo
    const alumnosSnap = await db.collection('usuarios')
      .where('rol', '==', 'alumno')
      .where('grupoId', '==', asignacionCalifActual.grupoId)
      .where('activo', '==', true)
      .get();
    
    alumnosCalifMateria = [];
    
    for (const doc of alumnosSnap.docs) {
      const alumno = {
        id: doc.id,
        nombre: doc.data().nombre,
        matricula: doc.data().matricula,
        calificaciones: {
          parcial1: null,
          parcial2: null,
          parcial3: null
        }
      };
      
      // Cargar calificaciones (nueva estructura)
      const docId = `${doc.id}_${asignacionCalifActual.materiaId}`;
      const calDoc = await db.collection('calificaciones').doc(docId).get();
      
      if (calDoc.exists) {
        const data = calDoc.data();
        alumno.calificaciones.parcial1 = data.parciales?.parcial1 ?? null;
        alumno.calificaciones.parcial2 = data.parciales?.parcial2 ?? null;
        alumno.calificaciones.parcial3 = data.parciales?.parcial3 ?? null;
      }
      
      alumnosCalifMateria.push(alumno);
    }
    
    // Ordenar alfabéticamente
    alumnosCalifMateria.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    // Generar tabla
    generarTablaCalificaciones();
    
    document.getElementById('contenedorCalificaciones').style.display = 'block';
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar calificaciones');
  }
}

// Generar tabla HTML con dropdowns
function generarTablaCalificaciones() {
  const container = document.getElementById('tablaCalificacionesCoord');
  
  let html = `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
        <thead>
          <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Alumno</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Matrícula</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Parcial 1</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Parcial 2</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Parcial 3</th>
            <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Promedio</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  alumnosCalifMateria.forEach((alumno, index) => {
    const promedio = calcularPromedioAlumno(alumno);
    
    html += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; border: 1px solid #ddd;">
          <strong>${alumno.nombre}</strong>
        </td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; color: #666;">
          ${alumno.matricula}
        </td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">
          ${generarDropdownCalif(index, 'parcial1', alumno.calificaciones.parcial1)}
        </td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">
          ${generarDropdownCalif(index, 'parcial2', alumno.calificaciones.parcial2)}
        </td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd;">
          ${generarDropdownCalif(index, 'parcial3', alumno.calificaciones.parcial3)}
        </td>
        <td style="padding: 12px; text-align: center; border: 1px solid #ddd; font-weight: bold; font-size: 1.2rem; color: #667eea;">
          ${promedio}
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
    <p style="text-align: center; color: #999; font-size: 0.85rem; margin-top: 10px;">
      Calificaciones de los 3 parciales
    </p>
  `;
  
  container.innerHTML = html;
}

// Generar dropdown de calificación
function generarDropdownCalif(index, parcial, valor) {
  const opciones = ['', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0', 'NP'];
  let html = `<select id="calif_${index}_${parcial}" style="width: 80px; padding: 8px; border: 2px solid #ddd; border-radius: 5px; text-align: center; font-size: 1.1rem; font-weight: bold;">`;
  
  opciones.forEach(opc => {
    const selected = (valor === null && opc === '') || (valor == opc) ? 'selected' : '';
    const texto = opc === '' ? '-' : opc;
    html += `<option value="${opc}" ${selected}>${texto}</option>`;
  });
  
  html += '</select>';
  return html;
}

// Calcular promedio
function calcularPromedioAlumno(alumno) {
  const cals = [alumno.calificaciones.parcial1, alumno.calificaciones.parcial2, alumno.calificaciones.parcial3]
    .filter(c => c !== null && c !== '' && c !== 'NP')
    .map(c => parseFloat(c));
  
  if (cals.length === 0) return '-';
  
  const suma = cals.reduce((a, b) => a + b, 0);
  return (suma / cals.length).toFixed(1);
}

// Guardar todas las calificaciones
async function guardarTodasCalificacionesCoord() {
  if (!confirm('¿Guardar las calificaciones de todos los alumnos?')) {
    return;
  }
  
  try {
    let guardadas = 0;
    
    for (let i = 0; i < alumnosCalifMateria.length; i++) {
      const alumno = alumnosCalifMateria[i];
      
      // Leer valores de dropdowns
      const p1 = document.getElementById(`calif_${i}_parcial1`).value;
      const p2 = document.getElementById(`calif_${i}_parcial2`).value;
      const p3 = document.getElementById(`calif_${i}_parcial3`).value;
      
      // Convertir a número o null
      const parcial1 = p1 === '' ? null : (p1 === 'NP' ? 'NP' : parseInt(p1));
      const parcial2 = p2 === '' ? null : (p2 === 'NP' ? 'NP' : parseInt(p2));
      const parcial3 = p3 === '' ? null : (p3 === 'NP' ? 'NP' : parseInt(p3));
      
      // Guardar en nueva estructura
      const docId = `${alumno.id}_${asignacionCalifActual.materiaId}`;
      
      await db.collection('calificaciones').doc(docId).set({
        alumnoId: alumno.id,
        materiaId: asignacionCalifActual.materiaId,
        grupoId: asignacionCalifActual.grupoId,
        profesorId: asignacionCalifActual.profesorId,
        periodo: asignacionCalifActual.periodo,
        parciales: {
          parcial1: parcial1,
          parcial2: parcial2,
          parcial3: parcial3
        },
        actualizadoPor: usuarioActual.uid,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      guardadas++;
    }
    
    alert(`Calificaciones guardadas exitosamente!\n\n${guardadas} alumnos actualizados.`);
    
    // Recargar
    cargarCalificacionesMateria();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar calificaciones');
  }
}



// ===== GENERAR ACTA DE CALIFICACIONES PDF =====

function descargarActaPDF() {
  if (!asignacionCalifActual || alumnosCalifMateria.length === 0) {
    alert('Primero selecciona una materia y carga los alumnos.');
    return;
  }
  
  try {
    // Verificar que jsPDF esté cargado
    if (typeof window.jspdf === 'undefined') {
      alert('Error: jsPDF no está cargado. Recarga la página.');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Obtener ancho de página
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Fecha actual
    const fecha = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Agregar logos (desde logoPdf.js)
    if (typeof agregarLogosAlPDF === 'function') {
      agregarLogosAlPDF(doc);
    }
    
    // Encabezado
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ACTA DE CALIFICACIONES', 105, 35, { align: 'center' });
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(50, 40, 160, 40);
    //doc.line(20, 30, 190, 30); linea mal
    
    // Información de la materia
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    let y = 50;
    
    // Fecha arriba a la derecha
    doc.text(`Fecha: ${fecha}`, pageWidth - 20, y, { align: 'right' });
    y += 5;
    
    doc.text(`Materia: ${asignacionCalifActual.materiaNombre}`, 20, y);
    y += 5;
    doc.text(`Grupo: ${asignacionCalifActual.grupoNombre}`, 20, y);
    y += 5;
    doc.text(`Profesor: ${asignacionCalifActual.profesorNombre}`, 20, y);
    y += 5;
    doc.text(`Periodo: ${asignacionCalifActual.periodo}`, 20, y);
    
    y += 10;
    
    // Preparar datos para la tabla
    const tableData = [];
    let sumaPromedios = 0;
    let countPromedios = 0;
    
    alumnosCalifMateria.forEach((alumno, index) => {
      const promedio = calcularPromedioAlumno(alumno);
      
      if (promedio !== '-') {
        sumaPromedios += parseFloat(promedio);
        countPromedios++;
      }
      
      tableData.push([
        (index + 1).toString(),
        alumno.matricula,
        alumno.nombre,
        promedio
      ]);
    });
    
    // Calcular promedio grupal
    const promedioGrupal = countPromedios > 0 
      ? (sumaPromedios / countPromedios).toFixed(1) 
      : '-';
    
    // Generar tabla
    doc.autoTable({
      startY: y,
      head: [['N.', 'Matrícula', 'Nombre del Alumno', 'Calificion']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [108, 29, 69],  // #6C1D45
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'left', cellWidth: 100 },
        3: { halign: 'center', cellWidth: 35, fontStyle: 'bold' }
      }
    });
    
    // Pie de página con estadísticas
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');

    y += 5;
    
    doc.text(`Total de alumnos: ${alumnosCalifMateria.length}`, 20, finalY);
    doc.text(`Promedio del grupo: ${promedioGrupal}`, 20, finalY + 7);
    
    // Línea de firmas
    const firmasY = finalY + 30;
    doc.setLineWidth(0.3);
    doc.line(30, firmasY, 90, firmasY);
    doc.line(120, firmasY, 180, firmasY);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('Profesor', 60, firmasY + 5, { align: 'center' });
    doc.text('Coordinador', 150, firmasY + 5, { align: 'center' });
    
    // Generar nombre del archivo
    const nombreArchivo = `Acta_${asignacionCalifActual.materiaCodigo}_${asignacionCalifActual.grupoNombre}_${asignacionCalifActual.periodo}.pdf`;
    
    // Descargar
    doc.save(nombreArchivo);
    
    console.log('PDF generado:', nombreArchivo);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar PDF. Verifica que jsPDF esté cargado correctamente.');
  }
}



// ===== GESTIÓN DE PERIODOS =====

let periodoActivo = null;

// Cargar periodos al abrir la sección
async function cargarPeriodos() {
  try {
    // Obtener periodo activo del coordinador
    const configDoc = await db.collection('configuracion')
      .doc(`periodo_${usuarioActual.carreraId}`)
      .get();
    
    if (configDoc.exists) {
      periodoActivo = configDoc.data().periodoActivo;
    } else {
      // Si no existe, crear con periodo actual
      periodoActivo = generarPeriodoActual();
      await db.collection('configuracion')
        .doc(`periodo_${usuarioActual.carreraId}`)
        .set({
          periodoActivo: periodoActivo,
          carreraId: usuarioActual.carreraId,
          fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Actualizar selector
    await actualizarSelectorPeriodos();
    
    // Cargar lista de periodos con estadísticas
    await cargarListaPeriodos();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Generar periodo actual (formato: YYYY-S)
function generarPeriodoActual() {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1; // 0-11
  const semestre = mes <= 6 ? 1 : 2;
  return `${año}-${semestre}`;
}

// Actualizar selector de periodos
async function actualizarSelectorPeriodos() {
  const select = document.getElementById('selectPeriodoActivo');
  if (!select) return;
  
  try {
    // Obtener todos los periodos únicos de profesorMaterias
    const snapshot = await db.collection('profesorMaterias')
      .where('carreraId', '==', usuarioActual.carreraId)
      .get();
    
    const periodosSet = new Set();
    snapshot.forEach(doc => {
      const periodo = doc.data().periodo;
      if (periodo) periodosSet.add(periodo);
    });
    
    // Agregar periodo activo si no está
    if (periodoActivo) periodosSet.add(periodoActivo);
    
    // Ordenar periodos
    const periodos = Array.from(periodosSet).sort().reverse();
    
    // Llenar selector
    select.innerHTML = '';
    periodos.forEach(periodo => {
      const option = document.createElement('option');
      option.value = periodo;
      option.textContent = periodo + (periodo === periodoActivo ? ' (Activo)' : '');
      if (periodo === periodoActivo) option.selected = true;
      select.appendChild(option);
    });
    
    if (periodos.length === 0) {
      select.innerHTML = '<option value="">Sin periodos</option>';
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Cambiar periodo activo
async function cambiarPeriodoActivo() {
  const select = document.getElementById('selectPeriodoActivo');
  const nuevoPeriodo = select.value;
  
  if (!nuevoPeriodo || nuevoPeriodo === periodoActivo) return;
  
  if (!confirm(`¿Cambiar el periodo activo a ${nuevoPeriodo}?\n\nTodo el sistema se filtrará por este periodo.`)) {
    select.value = periodoActivo;
    return;
  }
  
  try {
    await db.collection('configuracion')
      .doc(`periodo_${usuarioActual.carreraId}`)
      .set({
        periodoActivo: nuevoPeriodo,
        carreraId: usuarioActual.carreraId,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    periodoActivo = nuevoPeriodo;
    alert(`Periodo activo cambiado a: ${nuevoPeriodo}\n\nActualiza las secciones para ver los datos del nuevo periodo.`);
    
    await actualizarSelectorPeriodos();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cambiar periodo');
    select.value = periodoActivo;
  }
}

// Crear nuevo periodo
async function crearNuevoPeriodo() {
  const año = prompt('Año del periodo (ej: 2026):');
  if (!año || isNaN(año)) return;
  
  const semestre = prompt('Semestre (1 o 2):');
  if (semestre !== '1' && semestre !== '2') {
    alert('Semestre inválido. Debe ser 1 o 2.');
    return;
  }
  
  const nuevoPeriodo = `${año}-${semestre}`;
  
  // Verificar si ya existe
  const snapshot = await db.collection('profesorMaterias')
    .where('carreraId', '==', usuarioActual.carreraId)
    .where('periodo', '==', nuevoPeriodo)
    .limit(1)
    .get();
  
  if (!snapshot.empty) {
    alert(`El periodo ${nuevoPeriodo} ya existe.`);
    return;
  }
  
  if (confirm(`¿Crear y activar el periodo ${nuevoPeriodo}?`)) {
    await db.collection('configuracion')
      .doc(`periodo_${usuarioActual.carreraId}`)
      .set({
        periodoActivo: nuevoPeriodo,
        carreraId: usuarioActual.carreraId,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    
    periodoActivo = nuevoPeriodo;
    alert(`Periodo ${nuevoPeriodo} creado y activado.\n\nAhora puedes crear grupos y asignaciones para este periodo.`);
    
    await cargarPeriodos();
  }
}

// Cargar lista de periodos con estadísticas
async function cargarListaPeriodos() {
  const container = document.getElementById('listaPeriodos');
  if (!container) return;
  
  try {
    container.innerHTML = '<p style="text-align: center; color: #999;">Cargando...</p>';
    
    // Obtener periodos únicos
    const snapshot = await db.collection('profesorMaterias')
      .where('carreraId', '==', usuarioActual.carreraId)
      .get();
    
    const periodoStats = {};
    
    snapshot.forEach(doc => {
      const periodo = doc.data().periodo;
      if (!periodo) return;
      
      if (!periodoStats[periodo]) {
        periodoStats[periodo] = {
          asignaciones: 0,
          activas: 0
        };
      }
      
      periodoStats[periodo].asignaciones++;
      if (doc.data().activa) periodoStats[periodo].activas++;
    });
    
    // Contar calificaciones por periodo
    const calificacionesSnap = await db.collection('calificaciones')
      .get();
    
    calificacionesSnap.forEach(doc => {
      const periodo = doc.data().periodo;
      if (periodo && periodoStats[periodo]) {
        periodoStats[periodo].calificaciones = (periodoStats[periodo].calificaciones || 0) + 1;
      }
    });
    
    // Ordenar periodos
    const periodos = Object.keys(periodoStats).sort().reverse();
    
    if (periodos.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999;">No hay periodos registrados.</p>';
      return;
    }
    
    let html = '<div style="display: grid; gap: 15px;">';
    
    periodos.forEach(periodo => {
      const stats = periodoStats[periodo];
      const esActivo = periodo === periodoActivo;
      const tamañoEstimado = (stats.calificaciones || 0) * 0.5; // KB aproximados
      
      html += `
        <div style="padding: 15px; border: 2px solid ${esActivo ? '#667eea' : '#ddd'}; border-radius: 10px; background: ${esActivo ? '#f0f4ff' : 'white'};">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="margin: 0 0 10px 0; color: #333;">
                ${periodo} ${esActivo ? '<span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">ACTIVO</span>' : ''}
              </h4>
              <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">
                Asignaciones: ${stats.asignaciones} (${stats.activas} activas) | 
                Calificaciones: ${stats.calificaciones || 0} | 
                Tamaño: ~${tamañoEstimado.toFixed(1)} KB
              </p>
            </div>
            <div>
              ${!esActivo ? `<button onclick="eliminarPeriodo('${periodo}')" 
                style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                Eliminar
              </button>` : '<span style="color: #667eea; font-weight: 600;">En uso</span>'}
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<p style="color: red;">Error al cargar periodos</p>';
  }
}

// Eliminar periodo completo
async function eliminarPeriodo(periodo) {
  if (periodo === periodoActivo) {
    alert('No puedes eliminar el periodo activo.');
    return;
  }
  
  const confirmacion = prompt(`ADVERTENCIA: Esto eliminará PERMANENTEMENTE:\n- Todas las asignaciones del periodo ${periodo}\n- Todas las calificaciones del periodo ${periodo}\n\nEscribe "ELIMINAR" para confirmar:`);
  
  if (confirmacion !== 'ELIMINAR') {
    return;
  }
  
  try {
    const batch = db.batch();
    let contador = 0;
    
    // Eliminar asignaciones
    const asignaciones = await db.collection('profesorMaterias')
      .where('carreraId', '==', usuarioActual.carreraId)
      .where('periodo', '==', periodo)
      .get();
    
    asignaciones.forEach(doc => {
      batch.delete(doc.ref);
      contador++;
    });
    
    // Eliminar calificaciones
    const calificaciones = await db.collection('calificaciones')
      .where('periodo', '==', periodo)
      .get();
    
    calificaciones.forEach(doc => {
      batch.delete(doc.ref);
      contador++;
    });
    
    await batch.commit();
    
    alert(`Periodo ${periodo} eliminado.\n\n${contador} documentos eliminados de Firestore.`);
    await cargarPeriodos();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar periodo');
  }
}



// ===== PROMOCIÓN DE SEMESTRE =====

function mostrarPromocionSemestre() {
  const html = `
    <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; margin: 20px auto;">
      <h3 style="margin: 0 0 20px 0; color: #667eea;">Promover Alumnos de Semestre</h3>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
        <strong>Importante:</strong> Esta acción moverá TODOS los alumnos del semestre origen al destino.
        Los grupos se crearán automáticamente manteniendo el turno y número de grupo.
      </div>
      
      <form onsubmit="ejecutarPromocion(event)">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Semestre Origen:</label>
          <select id="semestreOrigen" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
            <option value="">Seleccionar...</option>
            <option value="1">1° Semestre</option>
            <option value="2">2° Semestre</option>
            <option value="3">3° Semestre</option>
            <option value="4">4° Semestre</option>
            <option value="5">5° Semestre</option>
            <option value="6">6° Semestre</option>
            <option value="7">7° Semestre</option>
            <option value="8">8° Semestre</option>
            <option value="9">9° Semestre</option>
          </select>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Semestre Destino:</label>
          <select id="semestreDestino" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
            <option value="">Seleccionar...</option>
            <option value="2">2° Semestre</option>
            <option value="3">3° Semestre</option>
            <option value="4">4° Semestre</option>
            <option value="5">5° Semestre</option>
            <option value="6">6° Semestre</option>
            <option value="7">7° Semestre</option>
            <option value="8">8° Semestre</option>
            <option value="9">9° Semestre</option>
          </select>
          <small style="color: #666;">Ejemplo: 1° → 2°, o 3° → 4°</small>
        </div>
        
        <div id="vistaPrevia" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; display: none;">
          <h4 style="margin: 0 0 10px 0;">Vista Previa:</h4>
          <div id="detallesPromocion"></div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="button" onclick="previsualizarPromocion()" 
                  style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Vista Previa
          </button>
          <button type="submit" 
                  style="flex: 1; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Ejecutar Promoción
          </button>
          <button type="button" onclick="cerrarModal()" 
                  style="flex: 1; padding: 12px; background: #f5f5f5; border: 2px solid #ddd; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGeneral').style.display = 'flex';
}

async function previsualizarPromocion() {
  const origen = document.getElementById('semestreOrigen').value;
  const destino = document.getElementById('semestreDestino').value;
  
  if (!origen || !destino) {
    alert('Selecciona ambos semestres');
    return;
  }
  
  if (parseInt(destino) <= parseInt(origen)) {
    alert('El semestre destino debe ser mayor que el origen');
    return;
  }
  
  try {
    // Buscar grupos del semestre origen
    const grupos = await db.collection('grupos')
      .where('carreraId', '==', usuarioActual.carreraId)
      .where('semestre', '==', parseInt(origen))
      .get();
    
    if (grupos.empty) {
      alert(`No hay grupos en ${origen}° semestre`);
      return;
    }
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: #667eea; color: white;"><th style="padding: 8px; border: 1px solid #ddd;">Grupo Actual</th><th style="padding: 8px; border: 1px solid #ddd;">→</th><th style="padding: 8px; border: 1px solid #ddd;">Grupo Nuevo</th><th style="padding: 8px; border: 1px solid #ddd;">Alumnos</th></tr>';
    
    let totalAlumnos = 0;
    
    for (const doc of grupos.docs) {
      const grupoActual = doc.data();
      const nombreActual = grupoActual.nombre;
      
      // Generar nombre del nuevo grupo
      const nuevoNombre = generarNombreGrupoDestino(nombreActual, origen, destino);
      
      // Contar alumnos
      const alumnos = await db.collection('usuarios')
        .where('rol', '==', 'alumno')
        .where('grupoId', '==', doc.id)
        .get();
      
      totalAlumnos += alumnos.size;
      
      html += `<tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${nombreActual}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">→</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #667eea;">${nuevoNombre}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${alumnos.size}</td>
      </tr>`;
    }
    
    html += '</table>';
    html += `<p style="margin-top: 15px; font-weight: bold; text-align: center;">Total: ${totalAlumnos} alumnos en ${grupos.size} grupos</p>`;
    
    document.getElementById('detallesPromocion').innerHTML = html;
    document.getElementById('vistaPrevia').style.display = 'block';
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar vista previa');
  }
}

function generarNombreGrupoDestino(nombreActual, semestreOrigen, semestreDestino) {
  // Formato: TSGG-SIGLAS
  // T = Turno, S = Semestre, GG = Grupo
  
  // Extraer partes del nombre
  const regex = /^([1-3])([0-9])([0-9]{2})(.*)$/;
  const match = nombreActual.match(regex);
  
  if (!match) {
    // Si no coincide con el formato, solo reemplazar el semestre
    return nombreActual.replace(semestreOrigen, semestreDestino);
  }
  
  const turno = match[1];
  const grupo = match[3];
  const siglas = match[4];
  
  return `${turno}${semestreDestino}${grupo}${siglas}`;
}

async function ejecutarPromocion(event) {
  event.preventDefault();
  
  const origen = document.getElementById('semestreOrigen').value;
  const destino = document.getElementById('semestreDestino').value;
  
  if (!origen || !destino) {
    alert('Selecciona ambos semestres');
    return;
  }
  
  if (parseInt(destino) <= parseInt(origen)) {
    alert('El semestre destino debe ser mayor que el origen');
    return;
  }
  
  const confirmacion = confirm(
    `CONFIRMAR PROMOCIÓN\n\n` +
    `Semestre: ${origen}° → ${destino}°\n\n` +
    `Esto creará nuevos grupos y moverá a TODOS los alumnos.\n\n` +
    `¿Continuar?`
  );
  
  if (!confirmacion) return;
  
  try {
    // Buscar grupos del semestre origen
    const gruposOrigen = await db.collection('grupos')
      .where('carreraId', '==', usuarioActual.carreraId)
      .where('semestre', '==', parseInt(origen))
      .get();
    
    if (gruposOrigen.empty) {
      alert(`No hay grupos en ${origen}° semestre`);
      return;
    }
    
    let gruposCreados = 0;
    let alumnosMovidos = 0;
    
    // Para cada grupo origen
    for (const grupoDoc of gruposOrigen.docs) {
      const grupoActual = grupoDoc.data();
      const nombreNuevo = generarNombreGrupoDestino(grupoActual.nombre, origen, destino);
      
      // Crear nuevo grupo
      const nuevoGrupoRef = await db.collection('grupos').add({
        nombre: nombreNuevo,
        carreraId: usuarioActual.carreraId,
        semestre: parseInt(destino),
        turno: grupoActual.turno,
        activo: true,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      gruposCreados++;
      
      // Mover alumnos
      const alumnos = await db.collection('usuarios')
        .where('rol', '==', 'alumno')
        .where('grupoId', '==', grupoDoc.id)
        .get();
      
      const batch = db.batch();
      
      alumnos.forEach(alumnoDoc => {
        batch.update(alumnoDoc.ref, {
          grupoId: nuevoGrupoRef.id
        });
        alumnosMovidos++;
      });
      
      await batch.commit();
    }
    
    alert(
      `Promoción completada\n\n` +
      `Grupos creados: ${gruposCreados}\n` +
      `Alumnos movidos: ${alumnosMovidos}\n\n` +
      `Los alumnos ahora están en ${destino}° semestre.`
    );
    
    cerrarModal();
    cargarAlumnos();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al ejecutar promoción');
  }
}