// controlAlumno_historial.js
// Extension para controlAlumno.html - Visualizacion de historial de calificaciones

// AGREGAR este boton en el HTML despues del boton "Ver Horario":
/*
<button onclick="verHistorialCompleto()" class="btn-historial" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; margin-top: 10px;">
  Ver Historial de Calificaciones
</button>
*/

// Funcion para ver el historial completo de calificaciones
async function verHistorialCompleto() {
  if (!alumnoActual || !alumnoActual.id) {
    alert('No hay datos de alumno cargados');
    return;
  }
  
  try {
    // Obtener historial de calificaciones
    const historialSnap = await db.collection('historialCalificaciones')
      .where('alumnoId', '==', alumnoActual.id)
      .get();
    
    if (historialSnap.empty) {
      mostrarModalHistorial('No hay calificaciones en el historial', 'info');
      return;
    }
    
    // Agrupar por periodo
    const calificacionesPorPeriodo = {};
    historialSnap.forEach(doc => {
      const data = doc.data();
      const periodo = data.periodoArchivado;
      
      if (!calificacionesPorPeriodo[periodo]) {
        calificacionesPorPeriodo[periodo] = [];
      }
      
      calificacionesPorPeriodo[periodo].push(data);
    });
    
    // Construir HTML
    let html = `
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 1000px; margin: 20px auto; max-height: 85vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e0e0e0;">
          <h2 style="margin: 0; color: #6A2135;">Historial Completo de Calificaciones</h2>
          <button onclick="cerrarModalHistorial()" style="background: #f5f5f5; border: 2px solid #ddd; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Cerrar
          </button>
        </div>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <strong>Alumno:</strong> ${alumnoActual.nombre}<br>
          <strong>Matricula:</strong> ${alumnoActual.matricula}
        </div>
    `;
    
    // Ordenar periodos de mas reciente a mas antiguo
    const periodos = Object.keys(calificacionesPorPeriodo).sort().reverse();
    
    if (periodos.length === 0) {
      html += `
        <div style="text-align: center; padding: 40px; color: #999;">
          <p>No hay periodos en el historial</p>
        </div>
      `;
    } else {
      for (const periodo of periodos) {
        const calificaciones = calificacionesPorPeriodo[periodo];
        
        html += `
          <div style="margin-bottom: 30px; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6A2135 0%, #6A3221 100%); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700; font-size: 20px;">Periodo: ${periodo}</div>
                <div style="font-size: 14px; opacity: 0.9;">${calificaciones.length} materias</div>
              </div>
            </div>
            <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
              <table style="width: 100%; min-width: 600px; border-collapse: collapse;">
                <thead style="background: #f5f5f5;">
                  <tr>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Materia</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; width: 100px;">Parcial 1</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; width: 100px;">Parcial 2</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; width: 100px;">Parcial 3</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; width: 100px;">Promedio</th>
                  </tr>
                </thead>
                <tbody>
        `;
        
        calificaciones.forEach(cal => {
          const p1 = cal.parciales?.parcial1 ?? '-';
          const p2 = cal.parciales?.parcial2 ?? '-';
          const p3 = cal.parciales?.parcial3 ?? '-';
          
          // Calcular promedio
          let promedio = '-';
          const tieneNP = p1 === 'NP' || p2 === 'NP' || p3 === 'NP';
          
          if (tieneNP) {
            promedio = '5.0';
          } else {
            const cals = [p1, p2, p3]
              .filter(c => c !== '-' && c !== null && c !== undefined)
              .map(c => parseFloat(c))
              .filter(c => !isNaN(c));
            
            if (cals.length > 0) {
              promedio = (cals.reduce((a, b) => a + b, 0) / cals.length).toFixed(1);
            }
          }
          
          // Color del promedio
          let colorPromedio = '#6A2135';
          if (promedio !== '-') {
            const promedioNum = parseFloat(promedio);
            if (promedioNum < 6) colorPromedio = '#dc3545';
            else if (promedioNum >= 8) colorPromedio = '#4caf50';
          }
          
          html += `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px;">
                <strong>${cal.materiaNombre || 'Sin nombre'}</strong>
                <br><small style="color: #666;">${cal.materiaCodigo || ''}</small>
              </td>
              <td style="padding: 12px; text-align: center; font-weight: bold; color: ${p1 === 'NP' ? '#ff9800' : (p1 !== '-' ? '#4caf50' : '#999')};">
                ${p1}
              </td>
              <td style="padding: 12px; text-align: center; font-weight: bold; color: ${p2 === 'NP' ? '#ff9800' : (p2 !== '-' ? '#4caf50' : '#999')};">
                ${p2}
              </td>
              <td style="padding: 12px; text-align: center; font-weight: bold; color: ${p3 === 'NP' ? '#ff9800' : (p3 !== '-' ? '#4caf50' : '#999')};">
                ${p3}
              </td>
              <td style="padding: 12px; text-align: center; font-weight: bold; font-size: 1.1rem; background: #f8f9fa; color: ${colorPromedio};">
                ${promedio}
              </td>
            </tr>
          `;
        });
        
        html += `
                </tbody>
              </table>
            </div>
            <p style="text-align: center; color: #999; font-size: 0.85rem; padding: 10px;">
              Desliza horizontalmente para ver todas las columnas
            </p>
          </div>
        `;
      }
    }
    
    html += `
        <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <strong>Nota:</strong>
          <p style="margin: 5px 0 0 0;">Este historial muestra las calificaciones de periodos anteriores. Las calificaciones del periodo actual se muestran en la vista principal.</p>
        </div>
      </div>
    `;
    
    mostrarModalHistorial(html, 'html');
    
  } catch (error) {
    console.error('Error al cargar historial:', error);
    alert('Error al cargar historial de calificaciones');
  }
}

// Funcion para mostrar modal de historial
function mostrarModalHistorial(contenido, tipo) {
  // Crear modal si no existe
  let modal = document.getElementById('modalHistorial');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalHistorial';
    modal.style.cssText = 'display: none; position: fixed; z-index: 9999; inset: 0; background: rgba(0,0,0,0.5); overflow-y: auto; padding: 20px;';
    document.body.appendChild(modal);
  }
  
  if (tipo === 'html') {
    modal.innerHTML = contenido;
  } else {
    const colores = {
      info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
      success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
      error: { bg: '#ffebee', border: '#f44336', text: '#c62828' }
    };
    
    const color = colores[tipo] || colores.info;
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; margin: 20px auto;">
        <div style="background: ${color.bg}; border-left: 4px solid ${color.border}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="color: ${color.text}; font-size: 16px;">${contenido}</div>
        </div>
        <button onclick="cerrarModalHistorial()" style="width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Cerrar
        </button>
      </div>
    `;
  }
  
  modal.style.display = 'block';
}

// Funcion para cerrar modal de historial
function cerrarModalHistorial() {
  const modal = document.getElementById('modalHistorial');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (event) => {
  const modal = document.getElementById('modalHistorial');
  if (modal && event.target === modal) {
    cerrarModalHistorial();
  }
});

console.log('Funciones de historial de alumno cargadas');