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

async function cargarProfesores() {
  try {
    let query = db.collection('usuarios').where('rol', '==', 'profesor');
    
    // Si es coordinador, filtrar por su carrera
    if (usuarioActual.rol === 'coordinador' && usuarioActual.carreraId) {
      query = query.where('carreraId', '==', usuarioActual.carreraId);
    }
    
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
      const carreraNombre = carrerasMap[profesor.carreraId] || 'Sin carrera';
      
      html += `
        <div class="item">
          <div class="item-info">
            <h4>${profesor.nombre}</h4>
            <p>🎓 Carrera: ${carreraNombre}</p>
            <p>📧 ${profesor.email}</p>
            <p>${profesor.activo ? '<span style="color: #4caf50;">●</span> Activo' : '<span style="color: #f44336;">●</span> Inactivo'}</p>
          </div>
          <div class="item-acciones">
            <button onclick="editarProfesor('${doc.id}')" class="btn-editar">✏️ Editar</button>
            <button onclick="toggleActivoUsuario('${doc.id}', 'profesor', ${!profesor.activo})" class="botAzu">
              ${profesor.activo ? '🔒 Desactivar' : '🔓 Activar'}
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

// Obtener mapa de carreras (id -> nombre)
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

async function mostrarFormProfesor(profesorId = null) {
  const esEdicion = profesorId !== null;
  document.getElementById('tituloModal').textContent = esEdicion ? 'Editar Profesor' : 'Nuevo Profesor';
  
  // Cargar carreras disponibles
  let carrerasHtml = '';
  
  if (usuarioActual.rol === 'admin') {
    // Admin puede seleccionar cualquier carrera
    const carreras = await db.collection('carreras').get();
    carrerasHtml = '<option value="">Seleccionar carrera...</option>';
    carreras.forEach(doc => {
      const carrera = doc.data();
      carrerasHtml += `<option value="${doc.id}">${carrera.nombre}</option>`;
    });
  } else {
    // Coordinador: su carrera por defecto (oculto)
    carrerasHtml = `<option value="${usuarioActual.carreraId}" selected>${carreraActual ? carreraActual.nombre : 'Tu carrera'}</option>`;
  }
  
  const html = `
    <form onsubmit="guardarProfesor(event, '${profesorId || ''}')">
      <div class="form-grupo">
        <label>Nombre Completo: *</label>
        <input type="text" id="nombreProfesor" required placeholder="Nombre completo">
      </div>
      
      ${usuarioActual.rol === 'admin' ? `
        <div class="form-grupo">
          <label>Carrera: *</label>
          <select id="carreraProfesor" required>
            ${carrerasHtml}
          </select>
        </div>
      ` : `
        <input type="hidden" id="carreraProfesor" value="${usuarioActual.carreraId}">
        <div class="form-grupo">
          <label>Carrera:</label>
          <input type="text" value="${carreraActual ? carreraActual.nombre : 'Tu carrera'}" disabled>
        </div>
      `}
      
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
        <button type="submit" class="btn-guardar">💾 Guardar</button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
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
      
      if (usuarioActual.rol === 'admin' && profesor.carreraId) {
        document.getElementById('carreraProfesor').value = profesor.carreraId;
      }
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
  const carreraId = document.getElementById('carreraProfesor').value;
  
  if (!carreraId) {
    alert('Debes seleccionar una carrera');
    return;
  }
  
  const userData = {
    nombre: nombre,
    email: email,
    rol: 'profesor',
    carreraId: carreraId,  // ← IMPORTANTE: Guardar carreraId
    activo: activo
  };
  
  try {
    if (profesorId) {
      // Editar profesor existente
      await db.collection('usuarios').doc(profesorId).update({
        ...userData,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Profesor actualizado');
    } else {
      // Crear nuevo profesor
      const password = document.getElementById('passwordProfesor').value;
      
      // Guardar usuario actual para no perder sesión
      const currentUser = firebase.auth().currentUser;
      
      // Crear usuario en Authentication
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      
      // Crear documento en Firestore
      await db.collection('usuarios').doc(uid).set({
        ...userData,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Cerrar sesión del nuevo usuario y volver a autenticar al coordinador
      await firebase.auth().signOut();
      
      // Re-autenticar al usuario actual
      // NOTA: El usuario tendrá que hacer login de nuevo, pero es seguro
      
      alert('✅ Profesor creado. Por seguridad, deberás iniciar sesión nuevamente.');
      
      // Redirigir a login
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      
      return; // No continuar con el código
    }
    
    cerrarModal();
    cargarProfesores();
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      alert('❌ El email ya está registrado');
    } else {
      alert('❌ Error al guardar: ' + error.message);
    }
  }
}

function editarProfesor(id) {
  mostrarFormProfesor(id);
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