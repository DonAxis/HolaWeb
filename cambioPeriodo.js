// cambioPeriodo.js
// Sistema de Cambio de Periodo Individual por Carrera con Historial
// VERSIÓN CORREGIDA

// ===== CONSTANTES =====
const GRUPO_GRADUADOS = 'GRADUADOS';

// ===== FUNCIONES DE PERIODO =====

// Generar lista de periodos disponibles
function generarPeriodos() {
  const periodos = [];
  for (let year = 2024; year <= 2030; year++) {
    periodos.push(`${year}-1`);
    periodos.push(`${year}-2`);
  }
  return periodos;
}

// Cargar periodo actual de la carrera
async function cargarPeriodoCarrera(carreraId) {
  try {
    const docRef = db.collection('config').doc(`periodo_${carreraId}`);
    const doc = await docRef.get();
    
    if (doc.exists) {
      return doc.data().periodo || '2026-1';
    } else {
      await docRef.set({
        carreraId: carreraId,
        periodo: '2026-1',
        fechaCambio: firebase.firestore.FieldValue.serverTimestamp(),
        periodoAnterior: null
      });
      return '2026-1';
    }
  } catch (error) {
    console.error('Error al cargar periodo de carrera:', error);
    return '2026-1';
  }
}

// Mostrar modal de cambio de periodo (CON BOTÓN AUTOMÁTICO)
async function mostrarCambioPeriodo(carreraId, periodoActual) {
  // Calcular siguiente periodo automaticamente
  const [year, semestre] = periodoActual.split('-').map(n => parseInt(n));
  let siguientePeriodo;
  
  if (semestre === 1) {
    siguientePeriodo = `${year}-2`;
  } else {
    siguientePeriodo = `${year + 1}-1`;
  }
  
  const html = `
    <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; margin: 20px auto;">
      <h3 style="margin: 0 0 20px 0; color: #216A32;">Cambiar Periodo Academico</h3>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-around; gap: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">Periodo actual:</div>
            <div style="font-size: 2rem; font-weight: bold; color: #216A32;">${periodoActual}</div>
          </div>
          
          <div style="font-size: 3rem; color: #999;">→</div>
          
          <div style="text-align: center;">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 5px;">Siguiente periodo:</div>
            <div style="font-size: 2rem; font-weight: bold; color: #1976d2;">${siguientePeriodo}</div>
          </div>
        </div>
      </div>
      
      <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <strong>Acciones al cambiar periodo:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Los alumnos avanzaran al siguiente semestre (Ej: 1101-MAT → 1201-MAT)</li>
          <li>Los alumnos de ultimo semestre pasaran a GRADUADOS</li>
          <li>Si no hay grupo para el siguiente semestre, se marcaran como Inactivos Academicos</li>
          <li>Se archivaran los grupos actuales en el historial</li>
          <li>Las asignaciones de profesores se desactivaran</li>
          <li>Las calificaciones se guardaran en el historial general</li>
        </ul>
      </div>
      
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <strong>IMPORTANTE:</strong>
        <p style="margin: 5px 0 0 0;">Esta accion solo afectara a tu carrera. Otras carreras mantienen su periodo independiente.</p>
      </div>
      
      <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <strong>ADVERTENCIA:</strong>
        <p style="margin: 5px 0 0 0;">Esta accion no se puede deshacer. Verifica que todo este correcto antes de continuar.</p>
      </div>
      
      <form onsubmit="ejecutarCambioPeriodoCarrera(event, '${carreraId}', '${periodoActual}', '${siguientePeriodo}')">
        <div style="display: flex; gap: 10px;">
          <button type="submit" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1.1rem;">
            Avanzar a ${siguientePeriodo}
          </button>
          <button type="button" onclick="cerrarModal()" style="flex: 1; padding: 14px; background: #f5f5f5; border: 2px solid #ddd; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1.1rem;">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'flex';
}

// Ejecutar cambio de periodo (CON SIGUIENTE PERIODO CALCULADO)
async function ejecutarCambioPeriodoCarrera(event, carreraId, periodoActual, siguientePeriodo) {
  event.preventDefault();
  
  const nuevoPeriodo = siguientePeriodo;
  
  const confirmacion = confirm(
    `CONFIRMAR CAMBIO DE PERIODO\n\n` +
    `De: ${periodoActual}\n` +
    `A: ${nuevoPeriodo}\n\n` +
    `Esta accion:\n` +
    `- Avanzara todos los alumnos al siguiente semestre\n` +
    `- Actualizara grupos automaticamente\n` +
    `- Archivara grupos en historial\n` +
    `- Desactivara asignaciones del periodo anterior\n` +
    `- Graduara alumnos de ultimo semestre\n` +
    `- Marcara como Inactivos Academicos si no hay grupo\n` +
    `- Guardara calificaciones en historial\n\n` +
    `¿Continuar?`
  );
  
  if (!confirmacion) return;
  
  try {
    document.getElementById('contenidoModal').innerHTML = `
      <div style="background: white; padding: 40px; border-radius: 15px; text-align: center; max-width: 500px; margin: 20px auto;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">Cambiando periodo...</div>
        <div style="color: #666; margin-bottom: 20px;">Por favor espera, esto puede tomar unos momentos.</div>
        <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
          <div id="progressBar" style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: 0%; transition: width 0.3s;"></div>
        </div>
        <div id="progressText" style="margin-top: 10px; color: #666; font-size: 14px;">Iniciando...</div>
      </div>
    `;
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    let alumnosAvanzados = 0;
    let alumnosGraduados = 0;
    let alumnosInactivos = 0;
    let gruposArchivados = 0;
    let asignacionesDesactivadas = 0;
    let calificacionesArchivadas = 0;
    
    // 1. ARCHIVAR GRUPOS ACTUALES (10%)
    progressBar.style.width = '10%';
    progressText.textContent = 'Archivando grupos...';
    
    await archivarGrupos(carreraId, periodoActual);
    gruposArchivados = await contarGruposArchivados(carreraId, periodoActual);
    
    // 2. PROCESAR ALUMNOS (40%) - LOGICA CORREGIDA
    progressBar.style.width = '30%';
    progressText.textContent = 'Procesando alumnos...';
    
    // Obtener todos los grupos activos de la carrera
    const gruposCarreraSnap = await db.collection('grupos')
      .where('carreraId', '==', carreraId)
      .where('activo', '==', true)
      .get();
    
    // Crear un mapa de grupos por semestre
    const gruposPorSemestre = {};
    gruposCarreraSnap.forEach(doc => {
      const grupo = doc.data();
      if (grupo.semestre) {
        if (!gruposPorSemestre[grupo.semestre]) {
          gruposPorSemestre[grupo.semestre] = [];
        }
        gruposPorSemestre[grupo.semestre].push({
          id: doc.id,
          nombre: grupo.nombre,
          turno: grupo.turno,
          semestre: grupo.semestre
        });
      }
    });
    
    // Determinar el semestre maximo
    const semestresDisponibles = Object.keys(gruposPorSemestre).map(s => parseInt(s));
    const semestreMaximo = semestresDisponibles.length > 0 
      ? Math.max(...semestresDisponibles)
      : 9;
    
    console.log(`Semestre maximo detectado: ${semestreMaximo}`);
    console.log(`Semestres disponibles:`, semestresDisponibles.sort((a,b) => a-b));
    
    const alumnosSnap = await db.collection('usuarios')
      .where('rol', '==', 'alumno')
      .where('carreraId', '==', carreraId)
      .where('periodo', '==', periodoActual)
      .where('activo', '==', true)
      .get();
    
    const totalAlumnos = alumnosSnap.size;
    let procesados = 0;
    
    for (const alumnoDoc of alumnosSnap.docs) {
      const alumno = alumnoDoc.data();
      const semestreActual = alumno.semestreActual || 1;
      const nuevoSemestre = semestreActual + 1;
      
      // REGLA: Si esta en el ultimo semestre disponible → GRADUAR
      if (semestreActual >= semestreMaximo) {
        await alumnoDoc.ref.update({
          activo: false,
          graduado: true,
          grupoId: GRUPO_GRADUADOS,
          semestreActual: semestreActual,
          fechaGraduacion: firebase.firestore.FieldValue.serverTimestamp(),
          periodoGraduacion: nuevoPeriodo
        });
        alumnosGraduados++;
        console.log(`Graduado: ${alumno.nombre} (estaba en semestre ${semestreActual})`);
      } 
      // REGLA: Si NO existe el siguiente semestre → INACTIVO ACADEMICO
      else if (!gruposPorSemestre[nuevoSemestre]) {
        await alumnoDoc.ref.update({
          activo: false,
          inactivoAcademico: true,
          motivoInactividad: 'Sin grupo disponible para el siguiente semestre',
          grupoId: null,
          semestreActual: nuevoSemestre,
          periodo: nuevoPeriodo,
          fechaInactivacion: firebase.firestore.FieldValue.serverTimestamp(),
          ultimoCambio: firebase.firestore.FieldValue.serverTimestamp()
        });
        alumnosInactivos++;
        console.log(`Inactivo Academico: ${alumno.nombre} (semestre ${nuevoSemestre} sin grupos)`);
      }
      // REGLA: Si existe el siguiente semestre → AVANZAR
      else {
        const gruposDisponibles = gruposPorSemestre[nuevoSemestre];
        
        // Intentar mantener el mismo turno y numero de grupo
        const grupoActualData = alumno.grupoId || '';
        const turnoMatch = grupoActualData.match(/^([123])/);
        const grupoNumMatch = grupoActualData.match(/(\d{2})-/);
        
        const turnoPreferido = turnoMatch ? turnoMatch[1] : null;
        const grupoNumPreferido = grupoNumMatch ? grupoNumMatch[1] : '01';
        
        let nuevoGrupo = null;
        
        // Buscar grupo que coincida con turno preferido
        if (turnoPreferido) {
          nuevoGrupo = gruposDisponibles.find(g => 
            g.nombre.startsWith(turnoPreferido + nuevoSemestre + grupoNumPreferido)
          );
        }
        
        // Si no encuentra, buscar cualquiera del mismo numero
        if (!nuevoGrupo) {
          nuevoGrupo = gruposDisponibles.find(g => 
            g.nombre.includes(grupoNumPreferido + '-')
          );
        }
        
        // Si aun no encuentra, tomar el primero disponible
        if (!nuevoGrupo) {
          nuevoGrupo = gruposDisponibles[0];
        }
        
        // AVANZAR ALUMNO
        await alumnoDoc.ref.update({
          semestreActual: nuevoSemestre,
          grupoId: nuevoGrupo.id,
          periodo: nuevoPeriodo,
          ultimoCambio: firebase.firestore.FieldValue.serverTimestamp()
        });
        alumnosAvanzados++;
        console.log(`Avanzado: ${alumno.nombre} → semestre ${nuevoSemestre}, grupo ${nuevoGrupo.nombre}`);
      }
      
      procesados++;
      const progreso = 30 + (procesados / totalAlumnos) * 30;
      progressBar.style.width = `${progreso}%`;
      progressText.textContent = `Procesando alumnos... ${procesados}/${totalAlumnos}`;
    }
    
    // 3. ARCHIVAR CALIFICACIONES (20%)
    progressBar.style.width = '60%';
    progressText.textContent = 'Archivando calificaciones...';
    
    calificacionesArchivadas = await archivarCalificaciones(carreraId, periodoActual, nuevoPeriodo);
    
    // 4. DESACTIVAR ASIGNACIONES (20%)
    progressBar.style.width = '80%';
    progressText.textContent = 'Desactivando asignaciones...';
    
    const asignacionesSnap = await db.collection('profesorMaterias')
      .where('carreraId', '==', carreraId)
      .where('periodo', '==', periodoActual)
      .where('activa', '==', true)
      .get();
    
    const batch = db.batch();
    asignacionesSnap.forEach(doc => {
      batch.update(doc.ref, {
        activa: false,
        fechaFin: firebase.firestore.FieldValue.serverTimestamp()
      });
      asignacionesDesactivadas++;
    });
    await batch.commit();
    
    // 5. ACTUALIZAR PERIODO DE LA CARRERA (10%)
    progressBar.style.width = '90%';
    progressText.textContent = 'Actualizando configuracion...';
    
    await db.collection('config').doc(`periodo_${carreraId}`).update({
      periodo: nuevoPeriodo,
      periodoAnterior: periodoActual,
      fechaCambio: firebase.firestore.FieldValue.serverTimestamp(),
      cambiadoPor: usuarioActual.uid
    });
    
    // 6. COMPLETADO (100%)
    progressBar.style.width = '100%';
    progressText.textContent = 'Completado';
    
    // Mostrar resultado
    setTimeout(() => {
      alert(
        `CAMBIO DE PERIODO COMPLETADO\n\n` +
        `Nuevo periodo: ${nuevoPeriodo}\n\n` +
        `Alumnos avanzados: ${alumnosAvanzados}\n` +
        `Alumnos graduados: ${alumnosGraduados}\n` +
        `Alumnos marcados como inactivos academicos: ${alumnosInactivos}\n` +
        `Grupos archivados: ${gruposArchivados}\n` +
        `Calificaciones archivadas: ${calificacionesArchivadas}\n` +
        `Asignaciones desactivadas: ${asignacionesDesactivadas}\n\n` +
        (alumnosInactivos > 0 
          ? `ATENCION: ${alumnosInactivos} alumno(s) marcado(s) como "Inactivo Academico".\n` +
            `Debes asignarles un grupo o eliminarlos.\n` +
            `Usa el boton "Gestionar Inactivos Academicos".\n\n`
          : '') +
        `Puedes armar los nuevos grupos y asignar profesores.`
      );
      
      cerrarModal();
      location.reload();
    }, 500);
    
  } catch (error) {
    console.error('Error al cambiar periodo:', error);
    alert('Error al cambiar periodo: ' + error.message);
    cerrarModal();
  }
}

// ===== RESTO DE FUNCIONES (sin cambios) =====

async function archivarGrupos(carreraId, periodoActual) {
  try {
    const gruposSnap = await db.collection('grupos')
      .where('carreraId', '==', carreraId)
      .where('activo', '==', true)
      .get();
    
    const batch = db.batch();
    
    for (const grupoDoc of gruposSnap.docs) {
      const grupo = grupoDoc.data();
      
      const historialRef = db.collection('historialGrupos').doc();
      batch.set(historialRef, {
        ...grupo,
        grupoOriginalId: grupoDoc.id,
        periodo: periodoActual,
        fechaArchivado: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      batch.update(grupoDoc.ref, {
        activo: false,
        fechaDesactivacion: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`Grupos archivados: ${gruposSnap.size}`);
    
  } catch (error) {
    console.error('Error al archivar grupos:', error);
    throw error;
  }
}

async function contarGruposArchivados(carreraId, periodo) {
  try {
    const snap = await db.collection('historialGrupos')
      .where('carreraId', '==', carreraId)
      .where('periodo', '==', periodo)
      .get();
    
    return snap.size;
  } catch (error) {
    console.error('Error al contar grupos archivados:', error);
    return 0;
  }
}

async function archivarCalificaciones(carreraId, periodoActual, nuevoPeriodo) {
  try {
    const calificacionesSnap = await db.collection('calificaciones')
      .where('periodo', '==', periodoActual)
      .get();
    
    const batch = db.batch();
    let contador = 0;
    
    for (const calDoc of calificacionesSnap.docs) {
      const calificacion = calDoc.data();
      
      const alumnoDoc = await db.collection('usuarios').doc(calificacion.alumnoId).get();
      if (!alumnoDoc.exists || alumnoDoc.data().carreraId !== carreraId) {
        continue;
      }
      
      const historialRef = db.collection('historialCalificaciones').doc();
      batch.set(historialRef, {
        ...calificacion,
        calificacionOriginalId: calDoc.id,
        periodoArchivado: periodoActual,
        fechaArchivado: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      contador++;
      
      if (contador % 500 === 0) {
        await batch.commit();
        const newBatch = db.batch();
      }
    }
    
    if (contador % 500 !== 0) {
      await batch.commit();
    }
    
    console.log(`Calificaciones archivadas: ${contador}`);
    return contador;
    
  } catch (error) {
    console.error('Error al archivar calificaciones:', error);
    throw error;
  }
}

async function verHistorialGrupos(carreraId) {
  try {
    const snap = await db.collection('historialGrupos')
      .where('carreraId', '==', carreraId)
      .orderBy('fechaArchivado', 'desc')
      .get();
    
    if (snap.empty) {
      mostrarMensajeModal('No hay grupos archivados', 'info');
      return;
    }
    
    const gruposPorPeriodo = {};
    snap.forEach(doc => {
      const data = doc.data();
      const periodo = data.periodo;
      
      if (!gruposPorPeriodo[periodo]) {
        gruposPorPeriodo[periodo] = [];
      }
      
      gruposPorPeriodo[periodo].push(data);
    });
    
    let html = `
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 900px; margin: 20px auto; max-height: 80vh; overflow-y: auto;">
        <h3 style="margin: 0 0 20px 0; color: #216A32;">Historial de Grupos</h3>
    `;
    
    const periodos = Object.keys(gruposPorPeriodo).sort().reverse();
    
    for (const periodo of periodos) {
      const grupos = gruposPorPeriodo[periodo];
      
      html += `
        <div style="margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: #f5f5f5; padding: 15px; font-weight: 600; font-size: 18px;">
            Periodo: ${periodo} (${grupos.length} grupos)
          </div>
          <div style="padding: 15px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
      `;
      
      grupos.forEach(grupo => {
        html += `
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #667eea;">
            <div style="font-weight: 600; color: #333;">${grupo.nombre}</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              Semestre: ${grupo.semestre}<br>
              Turno: ${grupo.turno}
            </div>
          </div>
        `;
      });
      
      html += `
            </div>
          </div>
        </div>
      `;
    }
    
    html += `
        <button onclick="cerrarModal()" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 20px;">
          Cerrar
        </button>
      </div>
    `;
    
    document.getElementById('contenidoModal').innerHTML = html;
    document.getElementById('modalGenerico').style.display = 'flex';
    
  } catch (error) {
    console.error('Error al ver historial:', error);
    alert('Error al cargar historial de grupos');
  }
}

function mostrarMensajeModal(mensaje, tipo) {
  const colores = {
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
    error: { bg: '#ffebee', border: '#f44336', text: '#c62828' }
  };
  
  const color = colores[tipo] || colores.info;
  
  const html = `
    <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; margin: 20px auto;">
      <div style="background: ${color.bg}; border-left: 4px solid ${color.border}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <div style="color: ${color.text}; font-size: 16px;">${mensaje}</div>
      </div>
      <button onclick="cerrarModal()" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
        Cerrar
      </button>
    </div>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'flex';
}

console.log('Sistema de Cambio de Periodo cargado (VERSION CORREGIDA)');