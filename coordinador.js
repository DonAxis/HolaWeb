// coordinador.js
// Panel de Coordinador - Gestión Completa

const auth = firebase.auth();
let usuarioActual = null;
let carreraActual = null;

// ===== PROTECCIÓN Y AUTENTICACIÓN =====
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log('❌ No hay sesión activa');
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
    return;
  }

  try {
    const userDoc = await db.collection('usuarios').doc(user.uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ Usuario no encontrado');
      await auth.signOut();
      window.location.href = 'login.html';
      return;
    }

    usuarioActual = userDoc.data();
    usuarioActual.uid = user.uid;

    // Verificar rol (coordinador o admin)
    if (usuarioActual.rol !== 'coordinador' && usuarioActual.rol !== 'admin') {
      console.log('❌ No tienes permisos de coordinador');
      alert('No tienes permisos para acceder');
      window.location.href = 'login.html';
      return;
    }

    console.log('✅ Coordinador autorizado:', usuarioActual.nombre);
    
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
    console.error('❌ Error:', error);
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
    document.getElementById('carreraInfo').textContent = '⚠️ Sin carrera asignada - Contacta al administrador';
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
      document.getElementById('carreraInfo').textContent = `📚 Carrera: ${carreraActual.nombre}`;
    } else {
      document.getElementById('carreraInfo').textContent = '⚠️ Carrera no encontrada';
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
            <button onclick="editarCarrera('${doc.id}')" class="btn-editar">✏️ Editar</button>
            ${usuarioActual.rol === 'admin' ? `<button onclick="eliminarCarrera('${doc.id}')" class="btn-eliminar">🗑️</button>` : ''}
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
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
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
            <p>Código: ${materia.codigo} | Créditos: ${materia.creditos || 0} | Semestre: ${materia.semestre || 'N/A'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarMateria('${doc.id}')" class="btn-editar">✏️ Editar</button>
            <button onclick="eliminarMateria('${doc.id}')" class="btn-eliminar">🗑️</button>
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
        <label>Código:</label>
        <input type="text" id="codigoMateria" required placeholder="Ej: WEB101">
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
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
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
            <button onclick="editarGrupo('${doc.id}')" class="btn-editar">✏️ Editar</button>
            <button onclick="eliminarGrupo('${doc.id}')" class="btn-eliminar">🗑️</button>
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
        <label>Nombre del Grupo:</label>
        <input type="text" id="nombreGrupo" required placeholder="Ej: 3101TT">
      </div>
      <div class="form-grupo">
        <label>Semestre:</label>
        <input type="number" id="semestreGrupo" min="1" max="12" required>
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
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
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
            <h4>📚 ${asignacion.materiaNombre} (${asignacion.materiaId})</h4>
            <p>👨‍🏫 Profesor: ${asignacion.profesorNombre}</p>
            <p>👥 Grupo: ${asignacion.grupoNombre} | 📅 Periodo: ${asignacion.periodo}</p>
          </div>
          <div class="item-acciones">
            <button onclick="reasignarProfesor('${doc.id}')" class="btn-editar">🔄 Reasignar</button>
            <button onclick="desactivarAsignacion('${doc.id}')" class="btn-eliminar">❌ Desactivar</button>
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
  
  // Cargar profesores
  const profesoresSnap = await db.collection('usuarios').where('rol', '==', 'profesor').get();
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
        <input type="text" id="periodoAsignar" required placeholder="Ej: 2025-1" value="2025-1">
        <small style="color: #666;">Formato: AÑO-SEMESTRE (ej: 2025-1)</small>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar">💾 Asignar Profesor</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
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
    alert('✅ Profesor asignado correctamente');
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
    
    alert('✅ Asignación desactivada');
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
            <h4>👨‍🎓 ${inscripcion.alumnoNombre} (${inscripcion.alumnoMatricula})</h4>
            <p>📚 Materia: ${inscripcion.materiaNombre}</p>
            <p>👥 Grupo: ${inscripcion.grupoNombre} | 📅 Periodo: ${inscripcion.periodo}</p>
          </div>
          <div class="item-acciones">
            <button onclick="darDeBajaAlumno('${doc.id}')" class="btn-eliminar">❌ Dar de Baja</button>
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
        <input type="text" id="periodoInscribir" required placeholder="Ej: 2025-1" value="2025-1">
        <small style="color: #666;">Formato: AÑO-SEMESTRE (ej: 2025-1)</small>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar">💾 Inscribir Alumno</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
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
    alert('❌ Este alumno ya está inscrito en esta materia y grupo');
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
    alert('✅ Alumno inscrito correctamente');
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
    
    alert('✅ Alumno dado de baja');
    cargarInscripciones();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al dar de baja');
  }
}



// ===== GESTIÓN DE PROFESORES (CREAR/EDITAR) =====
// SOLUCIÓN: Profesores Multi-Carrera + Sin Cerrar Sesión

// ===== GESTIÓN DE PROFESORES MULTI-CARRERA =====

// Buscar si un profesor ya existe por email
async function buscarProfesorPorEmail(email) {
  try {
    const snapshot = await db.collection('usuarios')
      .where('email', '==', email)
      .where('rol', '==', 'profesor')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function cargarProfesores() {
  try {
    let query = db.collection('usuarios').where('rol', '==', 'profesor');
    
    const snapshot = await query.get();
    const container = document.getElementById('listaProfesores');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay profesores registrados</div>';
      return;
    }
    
    // Cargar nombres de carreras
    const carrerasMap = await obtenerMapaCarreras();
    
    let html = '';
    snapshot.forEach(doc => {
      const profesor = doc.data();
      
      // Filtrar por carrera del coordinador
      if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
        // Solo mostrar si el profesor tiene esta carrera
        if (!profesor.carreras || !profesor.carreras.includes(usuarioActual.carreraId)) {
          return; // Skip este profesor
        }
      }
      
      // Obtener nombres de todas las carreras del profesor
      let carrerasTexto = 'Sin carreras';
      if (profesor.carreras && profesor.carreras.length > 0) {
        const nombresCarreras = profesor.carreras
          .map(carreraId => carrerasMap[carreraId] || carreraId)
          .join(', ');
        carrerasTexto = nombresCarreras;
      }
      
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${profesor.nombre}</h4>
            <p>🎓 Carreras: ${carrerasTexto}</p>
            <p>📧 ${profesor.email}</p>
            <p>${profesor.activo ? '<span style="color: #4caf50;">●</span> Activo' : '<span style="color: #f44336;">●</span> Inactivo'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarProfesor('${doc.id}')" class="btn-editar">✏️ Editar</button>
            <button onclick="gestionarCarrerasProfesor('${doc.id}')" class="botAzu">🎓 Carreras</button>
            <button onclick="toggleActivoUsuario('${doc.id}', 'profesor', ${!profesor.activo})" class="botAzu">
              ${profesor.activo ? '🔒 Desactivar' : '🔓 Activar'}
            </button>
          </div>
        </div>
      `;
    });
    
    if (html === '') {
      container.innerHTML = '<div class="sin-datos">No hay profesores en esta carrera</div>';
    } else {
      container.innerHTML = html;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar profesores');
  }
}

async function mostrarFormProfesor(profesorId = null) {
  const esEdicion = profesorId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Profesor' : 'Nuevo Profesor';
  
  // Si es edición, cargar datos
  let profesorExistente = null;
  if (esEdicion) {
    const doc = await db.collection('usuarios').doc(profesorId).get();
    if (doc.exists) {
      profesorExistente = doc.data();
    }
  }
  
  // Cargar carreras
  const carrerasMap = await obtenerMapaCarreras();
  let carreraInput = '';
  
  if (usuarioActual.rol === 'coordinador') {
    // COORDINADOR: Su carrera en formato de cuadro (sin checkbox, solo texto)
    const nombreCarrera = carrerasMap[usuarioActual.carreraId] || 'Tu carrera';
    
    carreraInput = `
      <input type="hidden" id="carrerasProfesor" value="${usuarioActual.carreraId}">
      <div class="form-grupo">
        <label>Carreras: *</label>
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; 
                    background: #f9f9f9;">
          <div style="color: #333; font-weight: 500;">
            • ${nombreCarrera}
          </div>
        </div>
        <small style="color: #666;">Los profesores se registran en tu carrera</small>
      </div>
    `;
  } else {
    // ADMIN: Selector múltiple de carreras con checkboxes
    const carreras = await db.collection('carreras').get();
    let checkboxes = '';
    
    carreras.forEach(doc => {
      const carrera = doc.data();
      const carreraId = doc.id;
      const checked = profesorExistente && profesorExistente.carreras && 
                      profesorExistente.carreras.includes(carreraId) ? 'checked' : '';
      
      checkboxes += `
        <label style="display: block; margin: 8px 0; padding: 5px; border-radius: 4px; cursor: pointer;">
          <input type="checkbox" name="carreras" value="${carreraId}" ${checked} 
                 style="margin-right: 8px;">
          <span>${carrera.nombre}</span>
        </label>
      `;
    });
    
    carreraInput = `
      <div class="form-grupo">
        <label>Carreras: * (Selecciona al menos una)</label>
        <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px; 
                    max-height: 200px; overflow-y: auto; background: #fafafa;">
          ${checkboxes}
        </div>
        <small style="color: #666;">Un profesor puede dar clases en múltiples carreras</small>
      </div>
    `;
  }
  
  const html = `
    <form onsubmit="guardarProfesor(event, '${profesorId || ''}')">
      <div class="form-grupo">
        <label>Nombre Completo: *</label>
        <input type="text" id="nombreProfesor" required placeholder="Nombre completo" 
               value="${profesorExistente ? profesorExistente.nombre : ''}">
      </div>
      
      <div class="form-grupo">
        <label>Email: *</label>
        <input type="email" id="emailProfesor" required placeholder="profesor@escuela.com"
               value="${profesorExistente ? profesorExistente.email : ''}"
               ${esEdicion ? 'readonly style="background: #f0f0f0; cursor: not-allowed;"' : ''}>
        <small id="emailWarning" style="color: #ff9800; display: none; margin-top: 5px; display: block;"></small>
      </div>
      
      ${!esEdicion ? `
        <div class="form-grupo">
          <label>Contraseña: *</label>
          <input type="password" id="passwordProfesor" required minlength="6" 
                 placeholder="Mínimo 6 caracteres" value="Profesor123!">
          <small style="color: #666;">El profesor podrá cambiarla después</small>
        </div>
      ` : ''}
      
      ${carreraInput}
      
      <div class="form-grupo">
        <label>
          <input type="checkbox" id="activoProfesor" 
                 ${profesorExistente ? (profesorExistente.activo ? 'checked' : '') : 'checked'}>
          Profesor activo
        </label>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  // Verificar email al salir del campo (solo si no es edición)
  if (!esEdicion) {
    document.getElementById('emailProfesor').addEventListener('blur', async function() {
      const email = this.value.trim();
      if (email) {
        const profesorExiste = await buscarProfesorPorEmail(email);
        if (profesorExiste) {
          const carrerasMap = await obtenerMapaCarreras();
          const carrerasActuales = profesorExiste.carreras || [];
          const nombresCarreras = carrerasActuales.map(id => carrerasMap[id] || id).join(', ');
          
          document.getElementById('emailWarning').innerHTML = 
            `⚠️ <strong>Este email ya está registrado</strong> en: ${nombresCarreras}<br>
            Al guardar, se agregará tu carrera a este profesor existente.`;
          document.getElementById('emailWarning').style.display = 'block';
        } else {
          document.getElementById('emailWarning').style.display = 'none';
        }
      }
    });
  }
}

async function guardarProfesor(event, profesorId) {
  event.preventDefault();
  
  const nombre = document.getElementById('nombreProfesor').value.trim();
  const email = document.getElementById('emailProfesor').value.trim();
  const activo = document.getElementById('activoProfesor').checked;
  
  // Obtener carreras según el rol
  let carreras = [];
  
  if (usuarioActual.rol === 'coordinador') {
    // Coordinador: su carrera
    carreras = [usuarioActual.carreraId];
  } else {
    // Admin: carreras seleccionadas
    const checkboxes = document.querySelectorAll('input[name="carreras"]:checked');
    carreras = Array.from(checkboxes).map(cb => cb.value);
    
    if (carreras.length === 0) {
      alert('⚠️ Debes seleccionar al menos una carrera');
      return;
    }
  }
  
  const userData = {
    nombre: nombre,
    email: email,
    rol: 'profesor',
    carreras: carreras,
    activo: activo
  };
  
  try {
    if (profesorId) {
      // ===== EDITAR PROFESOR EXISTENTE =====
      await db.collection('usuarios').doc(profesorId).update({
        ...userData,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Profesor actualizado correctamente');
      cerrarModal();
      cargarProfesores();
      
    } else {
      // ===== CREAR NUEVO O ACTUALIZAR EXISTENTE =====
      
      // Verificar si ya existe por email
      const profesorExiste = await buscarProfesorPorEmail(email);
      
      if (profesorExiste) {
        // YA EXISTE - Agregar nueva carrera sin duplicar
        const carrerasActuales = profesorExiste.carreras || [];
        const carrerasNuevas = [...new Set([...carrerasActuales, ...carreras])];
        
        // Verificar si realmente hay cambios
        const hayNuevasCarreras = carrerasNuevas.length > carrerasActuales.length;
        
        if (!hayNuevasCarreras) {
          alert('ℹ️ Este profesor ya está asignado a esta carrera');
          cerrarModal();
          return;
        }
        
        await db.collection('usuarios').doc(profesorExiste.id).update({
          carreras: carrerasNuevas,
          nombre: nombre, // Actualizar nombre por si cambió
          fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        const carrerasMap = await obtenerMapaCarreras();
        const nuevasAgregadas = carrerasNuevas
          .filter(c => !carrerasActuales.includes(c))
          .map(c => carrerasMap[c])
          .join(', ');
        
        alert(`✅ Profesor agregado a nueva(s) carrera(s): ${nuevasAgregadas}\n\n(El email ya existía)`);
        cerrarModal();
        cargarProfesores();
        
      } else {
        // NO EXISTE - Crear nuevo en Authentication
        
        if (confirm('⚠️ IMPORTANTE:\n\nSe creará un nuevo usuario en el sistema.\nTu sesión se cerrará temporalmente.\n\n¿Continuar?\n\n(Tendrás que volver a iniciar sesión)')) {
          const password = document.getElementById('passwordProfesor').value;
          
          try {
            // Crear en Authentication
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;
            
            // Crear en Firestore
            await db.collection('usuarios').doc(uid).set({
              ...userData,
              fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Cerrar sesión del nuevo usuario
            await firebase.auth().signOut();
            
            alert('✅ Profesor creado correctamente.\n\nSerás redirigido al login en 2 segundos.');
            
            // Redirigir
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 2000);
            
          } catch (authError) {
            console.error('Error en Authentication:', authError);
            if (authError.code === 'auth/email-already-in-use') {
              alert('❌ Error: El email ya existe en Authentication.\n\nIntenta de nuevo o contacta al administrador.');
            } else {
              alert('❌ Error: ' + authError.message);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al guardar: ' + error.message);
  }
}

// Función auxiliar para buscar profesor por email
async function buscarProfesorPorEmail(email) {
  try {
    const snapshot = await db.collection('usuarios')
      .where('email', '==', email)
      .where('rol', '==', 'profesor')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Cargar profesores
async function cargarProfesores() {
  try {
    let query = db.collection('usuarios').where('rol', '==', 'profesor');
    
    const snapshot = await query.get();
    const container = document.getElementById('listaProfesores');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay profesores registrados</div>';
      return;
    }
    
    const carrerasMap = await obtenerMapaCarreras();
    
    let html = '';
    snapshot.forEach(doc => {
      const profesor = doc.data();
      
      // Si es coordinador, filtrar por su carrera
      if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
        if (!profesor.carreras || !profesor.carreras.includes(usuarioActual.carreraId)) {
          return; // Skip
        }
      }
      
      // Nombres de carreras
      let carrerasTexto = 'Sin carreras';
      if (profesor.carreras && profesor.carreras.length > 0) {
        carrerasTexto = profesor.carreras
          .map(id => carrerasMap[id] || id)
          .join(', ');
      }
      
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${profesor.nombre}</h4>
            <p>🎓 Carrera(s): ${carrerasTexto}</p>
            <p>📧 ${profesor.email}</p>
            <p>${profesor.activo ? '<span style="color: #4caf50;">●</span> Activo' : '<span style="color: #f44336;">●</span> Inactivo'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarProfesor('${doc.id}')" class="btn-editar">✏️ Editar</button>
            ${usuarioActual.rol === 'admin' ? `
              <button onclick="gestionarCarrerasProfesor('${doc.id}')" class="botAzu">🎓 Carreras</button>
            ` : ''}
            <button onclick="toggleActivoUsuario('${doc.id}', 'profesor', ${!profesor.activo})" class="botAzu">
              ${profesor.activo ? '🔒 Desactivar' : '🔓 Activar'}
            </button>
          </div>
        </div>
      `;
    });
    
    if (html === '') {
      container.innerHTML = '<div class="sin-datos">No hay profesores en tu carrera</div>';
    } else {
      container.innerHTML = html;
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar profesores');
  }
}

// Gestionar carreras (solo admin)
async function gestionarCarrerasProfesor(profesorId) {
  const doc = await db.collection('usuarios').doc(profesorId).get();
  if (!doc.exists) {
    alert('Profesor no encontrado');
    return;
  }
  
  const profesor = doc.data();
  
  document.getElementById('tituloModal').textContent = `Gestionar Carreras: ${profesor.nombre}`;
  
  const carreras = await db.collection('carreras').get();
  let checkboxes = '';
  
  carreras.forEach(doc => {
    const carrera = doc.data();
    const carreraId = doc.id;
    const checked = profesor.carreras && profesor.carreras.includes(carreraId) ? 'checked' : '';
    
    checkboxes += `
      <label style="display: block; margin: 8px 0; padding: 5px;">
        <input type="checkbox" name="carreras" value="${carreraId}" ${checked}>
        ${carrera.nombre}
      </label>
    `;
  });
  
  const html = `
    <form onsubmit="actualizarCarrerasProfesor(event, '${profesorId}')">
      <p><strong>Profesor:</strong> ${profesor.nombre}</p>
      <p><strong>Email:</strong> ${profesor.email}</p>
      
      <div class="form-grupo">
        <label>Carreras asignadas:</label>
        <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px;">
          ${checkboxes}
        </div>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar">💾 Actualizar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
      </div>
    </form>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
}

async function actualizarCarrerasProfesor(event, profesorId) {
  event.preventDefault();
  
  const checkboxes = document.querySelectorAll('input[name="carreras"]:checked');
  const carreras = Array.from(checkboxes).map(cb => cb.value);
  
  if (carreras.length === 0) {
    alert('⚠️ Debes seleccionar al menos una carrera');
    return;
  }
  
  try {
    await db.collection('usuarios').doc(profesorId).update({
      carreras: carreras,
      fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert('✅ Carreras actualizadas');
    cerrarModal();
    cargarProfesores();
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al actualizar');
  }
}

function editarProfesor(id) {
  mostrarFormProfesor(id);
}

async function obtenerMapaCarreras() {
  try {
    const snapshot = await db.collection('carreras').get();
    const mapa = {};
    snapshot.forEach(doc => {
      mapa[doc.id] = doc.data().nombre;
    });
    return mapa;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}

// ===== GESTIÓN DE ALUMNOS (CREAR/EDITAR) =====

async function cargarAlumnos() {
  try {
    let query = db.collection('usuarios').where('rol', '==', 'alumno');
    
    // Filtrar por carrera si es coordinador
    if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
      query = query.where('carreraId', '==', usuarioActual.carreraId);
    }
    
    const snapshot = await query.get();
    const container = document.getElementById('listaAlumnos');
    
    if (snapshot.empty) {
      container.innerHTML = '<div class="sin-datos">No hay alumnos registrados</div>';
      return;
    }
    
    // Cargar nombres de carreras
    const carrerasMap = await obtenerMapaCarreras();
    
    let html = '';
    snapshot.forEach(doc => {
      const alumno = doc.data();
      const carreraNombre = carrerasMap[alumno.carreraId] || 'Sin carrera';
      
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${alumno.nombre}</h4>
            <p>🎓 Carrera: ${carreraNombre}</p>
            <p>🆔 Matrícula: ${alumno.matricula || 'N/A'}</p>
            <p>📧 ${alumno.email}</p>
            <p>${alumno.activo ? '<span style="color: #4caf50;">●</span> Activo' : '<span style="color: #f44336;">●</span> Inactivo'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarAlumno('${doc.id}')" class="btn-editar">✏️ Editar</button>
            <button onclick="toggleActivoUsuario('${doc.id}', 'alumno', ${!alumno.activo})" class="botAzu">
              ${alumno.activo ? '🔒 Desactivar' : '🔓 Activar'}
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


function mostrarFormAlumno(alumnoId = null) {
  const esEdicion = alumnoId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Alumno' : 'Nuevo Alumno';
  
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
      
      ${!esEdicion ? `
        <div class="form-grupo">
          <label>Contraseña Temporal: *</label>
          <input type="text" id="passwordAlumno" required placeholder="Mínimo 6 caracteres" value="Alumno123!">
          <small style="color: #666;">El alumno podrá cambiarla después</small>
        </div>
      ` : ''}
      
      <div class="form-grupo">
        <label>
          <input type="checkbox" id="activoAlumno" checked>
          Alumno activo
        </label>
      </div>
      
      <div class="form-botones">
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
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
  const activo = document.getElementById('activoAlumno').checked;
  
  const userData = {
    nombre: nombre,
    matricula: matricula,
    email: email,
    rol: 'alumno',
    activo: activo
  };
  
  try {
    if (alumnoId) {
      // Editar
      await db.collection('usuarios').doc(alumnoId).update(userData);
      alert('✅ Alumno actualizado');
    } else {
      // Crear nuevo
      const password = document.getElementById('passwordAlumno').value;
      
      if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      // Guardar usuario admin actual
      const adminUser = auth.currentUser;
      
      // Crear en Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const newUid = userCredential.user.uid;
      
      // Guardar en Firestore
      userData.fechaCreacion = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('usuarios').doc(newUid).set(userData);
      
      // Cerrar sesión del nuevo usuario y restaurar admin
      await auth.signOut();
      const adminPass = prompt('Por seguridad, ingresa tu contraseña de coordinador:');
      await auth.signInWithEmailAndPassword(adminUser.email, adminPass);
      
      alert(`✅ Alumno creado!\n\nEmail: ${email}\nPassword: ${password}\nMatrícula: ${matricula}`);
    }
    
    cerrarModal();
    cargarAlumnos();
  } catch (error) {
    console.error('Error:', error);
    
    let mensaje = 'Error al guardar alumno';
    if (error.code === 'auth/email-already-in-use') {
      mensaje = 'Este email ya está registrado';
    } else if (error.code === 'auth/invalid-email') {
      mensaje = 'Email inválido';
    } else if (error.code === 'auth/weak-password') {
      mensaje = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    alert('❌ ' + mensaje);
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

console.log('📱 Panel de Coordinador cargado');

// SISTEMA DE CARGA MASIVA CSV PARA PROFESORES

// Agregar al HTML: Botón de carga CSV
// En la sección de profesores, después del botón "Nuevo Profesor"

/*
HTML a agregar en ControlCoordinador.html en seccionProfesores:

<div class="botones-accion">
  <button onclick="mostrarFormProfesor()" class="botAzu">➕ Nuevo Profesor</button>
  <button onclick="mostrarCargadorCSV()" class="botAzu">📁 Cargar CSV</button>
</div>
*/

// ===== CARGA MASIVA CSV =====

function mostrarCargadorCSV() {
  document.getElementById('tituloModal').textContent = '📁 Cargar Profesores desde CSV';
  
  const html = `
    <div style="max-width: 600px;">
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #1976d2;">📋 Formato del CSV:</h4>
        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Opción 1 (con encabezado):</strong></p>
        <code style="display: block; background: white; padding: 10px; border-radius: 4px; font-size: 0.85rem;">
nombre,email,password,carrera<br>
Juan Pérez,juan@escuela.com,Pass123,Matemáticas
        </code>
        
        <p style="margin: 15px 0 5px 0; font-size: 0.9rem;"><strong>Opción 2 (separado por TAB):</strong></p>
        <code style="display: block; background: white; padding: 10px; border-radius: 4px; font-size: 0.85rem;">
Juan Pérez[TAB]juan@escuela.com[TAB]Pass123[TAB]Matemáticas
        </code>
        
        <p style="margin: 15px 0 5px 0; color: #666; font-size: 0.85rem;">
          • El campo <strong>carrera</strong> debe coincidir con el nombre de una carrera existente<br>
          • Los profesores se crearán solo en Firestore (NO en Authentication)<br>
          • Deberán registrarse después con su email y contraseña
        </p>
      </div>
      
      <div class="form-grupo">
        <label>Seleccionar archivo CSV:</label>
        <input type="file" id="archivoCSV" accept=".csv,.txt" 
               style="width: 100%; padding: 10px; border: 2px dashed #ddd; border-radius: 8px;">
      </div>
      
      <div id="previewCSV" style="display: none; margin-top: 20px;">
        <h4>Vista Previa:</h4>
        <div id="contenidoPreview" style="max-height: 300px; overflow-y: auto; 
                                          border: 1px solid #ddd; padding: 10px; 
                                          border-radius: 5px; background: #fafafa;">
        </div>
        <div id="estadisticas" style="margin-top: 15px; padding: 10px; 
                                      background: #f5f5f5; border-radius: 5px;">
        </div>
      </div>
      
      <div class="form-botones" style="margin-top: 20px;">
        <button id="btnProcesarCSV" onclick="procesarCSV()" class="btn-guardar" style="display: none;">
          ✅ Cargar Profesores
        </button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
      </div>
    </div>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  // Event listener para el input file
  document.getElementById('archivoCSV').addEventListener('change', leerArchivoCSV);
}

let datosCSVParsed = [];

async function leerArchivoCSV(event) {
  const archivo = event.target.files[0];
  if (!archivo) return;
  
  const reader = new FileReader();
  
  reader.onload = async function(e) {
    const texto = e.target.result;
    
    // Detectar separador (coma o tab)
    const tieneTabs = texto.includes('\t');
    const separador = tieneTabs ? '\t' : ',';
    
    // Parsear CSV
    const lineas = texto.trim().split('\n');
    const datos = [];
    let tieneEncabezado = false;
    
    // Detectar si tiene encabezado
    const primeraLinea = lineas[0].toLowerCase();
    if (primeraLinea.includes('nombre') && primeraLinea.includes('email')) {
      tieneEncabezado = true;
      lineas.shift(); // Eliminar encabezado
    }
    
    // Procesar cada línea
    lineas.forEach((linea, index) => {
      linea = linea.trim();
      if (!linea) return; // Skip líneas vacías
      
      const campos = linea.split(separador).map(c => c.trim());
      
      if (campos.length >= 3) {
        datos.push({
          linea: index + 1,
          nombre: campos[0] || '',
          email: campos[1] || '',
          password: campos[2] || '',
          carreraNombre: campos[3] || ''
        });
      }
    });
    
    datosCSVParsed = datos;
    await mostrarPreviewCSV(datos);
  };
  
  reader.readAsText(archivo, 'UTF-8');
}

async function mostrarPreviewCSV(datos) {
  if (datos.length === 0) {
    alert('❌ El archivo está vacío o no tiene el formato correcto');
    return;
  }
  
  // Cargar mapa de carreras
  const carrerasMap = await obtenerMapaCarrerasInverso(); // nombre -> id
  
  // Validar datos
  let validos = 0;
  let errores = 0;
  let html = '<table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">';
  html += '<tr style="background: #f0f0f0; font-weight: bold;">';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Estado</th>';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Nombre</th>';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Email</th>';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Carrera</th>';
  html += '</tr>';
  
  datos.forEach(dato => {
    let estado = '✅';
    let errorMsg = '';
    let esValido = true;
    
    // Validaciones
    if (!dato.nombre) {
      estado = '❌';
      errorMsg += 'Sin nombre. ';
      esValido = false;
    }
    
    if (!dato.email || !dato.email.includes('@')) {
      estado = '❌';
      errorMsg += 'Email inválido. ';
      esValido = false;
    }
    
    if (!dato.password || dato.password.length < 6) {
      estado = '❌';
      errorMsg += 'Password debe tener al menos 6 caracteres. ';
      esValido = false;
    }
    
    if (!dato.carreraNombre) {
      estado = '⚠️';
      errorMsg += 'Sin carrera (se usará la del coordinador). ';
      // No es error fatal para coordinador
    } else if (!carrerasMap[dato.carreraNombre.toLowerCase()]) {
      estado = '❌';
      errorMsg += `Carrera "${dato.carreraNombre}" no existe. `;
      esValido = false;
    }
    
    dato.valido = esValido;
    dato.carreraId = carrerasMap[dato.carreraNombre.toLowerCase()] || usuarioActual.carreraId;
    
    if (esValido) validos++;
    else errores++;
    
    const colorFila = esValido ? '#f1f8e9' : '#ffebee';
    
    html += `<tr style="background: ${colorFila};">`;
    html += `<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${estado}</td>`;
    html += `<td style="padding: 8px; border: 1px solid #ddd;">${dato.nombre}</td>`;
    html += `<td style="padding: 8px; border: 1px solid #ddd;">${dato.email}</td>`;
    html += `<td style="padding: 8px; border: 1px solid #ddd;">${dato.carreraNombre || 'Tu carrera'}${errorMsg ? '<br><small style="color: red;">' + errorMsg + '</small>' : ''}</td>`;
    html += '</tr>';
  });
  
  html += '</table>';
  
  document.getElementById('contenidoPreview').innerHTML = html;
  
  // Estadísticas
  const stats = `
    <div style="display: flex; gap: 20px; justify-content: center;">
      <div style="text-align: center;">
        <div style="font-size: 2rem; color: #4caf50;">✅ ${validos}</div>
        <div style="font-size: 0.9rem; color: #666;">Válidos</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; color: #f44336;">❌ ${errores}</div>
        <div style="font-size: 0.9rem; color: #666;">Con errores</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 2rem; color: #2196f3;">📊 ${datos.length}</div>
        <div style="font-size: 0.9rem; color: #666;">Total</div>
      </div>
    </div>
  `;
  
  document.getElementById('estadisticas').innerHTML = stats;
  document.getElementById('previewCSV').style.display = 'block';
  
  if (validos > 0) {
    document.getElementById('btnProcesarCSV').style.display = 'inline-block';
    document.getElementById('btnProcesarCSV').textContent = 
      errores > 0 ? `✅ Cargar ${validos} Válidos (Omitir ${errores})` : `✅ Cargar ${validos} Profesores`;
  }
}

async function obtenerMapaCarrerasInverso() {
  try {
    const snapshot = await db.collection('carreras').get();
    const mapa = {};
    snapshot.forEach(doc => {
      const nombre = doc.data().nombre.toLowerCase().trim();
      mapa[nombre] = doc.id;
    });
    return mapa;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}

async function procesarCSV() {
  if (!confirm(`¿Cargar los profesores válidos?\n\nSe crearán en Firestore.\nLos profesores deberán registrarse después con su email y contraseña.`)) {
    return;
  }
  
  const btnProcesar = document.getElementById('btnProcesarCSV');
  btnProcesar.disabled = true;
  btnProcesar.textContent = '⏳ Procesando...';
  
  const datosValidos = datosCSVParsed.filter(d => d.valido);
  
  let exitosos = 0;
  let fallidos = 0;
  const erroresDetallados = [];
  
  for (const dato of datosValidos) {
    try {
      // Verificar si el email ya existe
      const existe = await buscarProfesorPorEmail(dato.email);
      
      if (existe) {
        // Actualizar: agregar carrera si no la tiene
        const carrerasActuales = existe.carreras || [];
        if (!carrerasActuales.includes(dato.carreraId)) {
          await db.collection('usuarios').doc(existe.id).update({
            carreras: [...carrerasActuales, dato.carreraId],
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
          });
          exitosos++;
        } else {
          // Ya tiene esta carrera
          exitosos++;
        }
      } else {
        // Crear nuevo (solo en Firestore)
        // Generar un ID temporal (se reemplazará cuando se registre en Auth)
        const docRef = await db.collection('usuarios').add({
          nombre: dato.nombre,
          email: dato.email,
          passwordTemporal: dato.password, // Guardar para que se registre después
          rol: 'profesor',
          carreras: [dato.carreraId],
          activo: true,
          estado: 'pendiente_registro', // Indica que debe registrarse
          fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        exitosos++;
      }
      
    } catch (error) {
      console.error('Error con', dato.email, error);
      fallidos++;
      erroresDetallados.push(`${dato.nombre}: ${error.message}`);
    }
  }
  
  // Mostrar resultado
  let mensaje = `✅ Carga completada:\n\n`;
  mensaje += `• ${exitosos} profesores cargados\n`;
  if (fallidos > 0) {
    mensaje += `• ${fallidos} fallidos\n\n`;
    mensaje += `Errores:\n${erroresDetallados.join('\n')}`;
  }
  mensaje += `\n\n⚠️ Los profesores deben registrarse con:\n`;
  mensaje += `- Su email\n`;
  mensaje += `- La contraseña del CSV`;
  
  alert(mensaje);
  
  cerrarModal();
  cargarProfesores();
}

// Función auxiliar (ya debe existir)
async function buscarProfesorPorEmail(email) {
  try {
    const snapshot = await db.collection('usuarios')
      .where('email', '==', email)
      .where('rol', '==', 'profesor')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}