// SISTEMA DE CARGA MASIVA CSV PARA PROFESORES

//////migro de coordinador.js


// ===== CARGA MASIVA CSV =====


function mostrarCargadorCSV() {
  document.getElementById('tituloModal').textContent = '📁 Cargar Profesores desde CSV';
  
  const html = `
    <div style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
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
        <div id="contenidoPreview" style="max-height: 400px; overflow-y: auto; 
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
  if (!confirm(`¿Cargar los profesores válidos?\n\n✅ NO cerrará tu sesión\n📋 Se descargará CSV con credenciales`)) {
    return;
  }
  
  const btnProcesar = document.getElementById('btnProcesarCSV');
  btnProcesar.disabled = true;
  btnProcesar.textContent = '⏳ Procesando...';
  
  const datosValidos = datosCSVParsed.filter(d => d.valido);
  
  let exitosos = 0;
  let fallidos = 0;
  const erroresDetallados = [];
  const credencialesCreadas = [];
  
  for (const dato of datosValidos) {
    try {
      btnProcesar.textContent = `⏳ Procesando ${exitosos + fallidos + 1}/${datosValidos.length}...`;
      
      // Verificar si el email ya existe en Firestore
      const existe = await buscarProfesorPorEmail(dato.email);
      
      if (existe) {
        // Ya existe - solo agregar carrera si no la tiene
        const carrerasActuales = existe.carreras || [];
        if (!carrerasActuales.includes(dato.carreraId)) {
          await db.collection('usuarios').doc(existe.id).update({
            carreras: [...carrerasActuales, dato.carreraId],
            fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
          });
          exitosos++;
          credencialesCreadas.push({
            nombre: dato.nombre,
            email: dato.email,
            password: dato.password,
            estado: 'Carrera agregada'
          });
        } else {
          exitosos++;
          credencialesCreadas.push({
            nombre: dato.nombre,
            email: dato.email,
            password: dato.password,
            estado: 'Ya existía'
          });
        }
      } else {
        // NO EXISTE - Crear solo en Firestore
        await db.collection('usuarios').add({
          nombre: dato.nombre,
          email: dato.email,
          passwordTemporal: dato.password,
          rol: 'profesor',
          carreras: [dato.carreraId],
          activo: true,
          estado: 'pendiente_registro',
          fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        exitosos++;
        credencialesCreadas.push({
          nombre: dato.nombre,
          email: dato.email,
          password: dato.password,
          estado: 'Creado - Pendiente registro'
        });
      }
      
    } catch (error) {
      console.error('Error con', dato.email, error);
      fallidos++;
      erroresDetallados.push(`${dato.nombre}: ${error.message}`);
    }
  }
  
  // Generar CSV para descargar
  let csvCredenciales = 'Nombre,Email,Password,Estado\n';
  credencialesCreadas.forEach(c => {
    csvCredenciales += `"${c.nombre}","${c.email}","${c.password}","${c.estado}"\n`;
  });
  
  // Crear archivo descargable
  const blob = new Blob([csvCredenciales], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'credenciales-profesores-' + new Date().toISOString().split('T')[0] + '.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Mostrar resumen
  let mensaje = `✅ Proceso completado:\n\n`;
  mensaje += `• ${exitosos} profesores procesados\n`;
  if (fallidos > 0) {
    mensaje += `• ${fallidos} con errores\n`;
    mensaje += `Errores: ${erroresDetallados.join(', ')}\n\n`;
  }
  
  mensaje += `\n📥 CSV descargado con credenciales\n\n`;
  mensaje += `📧 Envía a los profesores el link:\n`;
  mensaje += `${window.location.origin}/registro-profesor.html\n\n`;
  mensaje += `Con sus credenciales del CSV`;
  
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
// ===== CARGA MASIVA CSV PARA ALUMNOS =====

function mostrarCargadorCSVAlumnos() {
  document.getElementById('tituloModal').textContent = '📁 Cargar Alumnos desde CSV';
  
  const html = `
    <div style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
      <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #1976d2;">📋 Formato del CSV:</h4>
        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Con encabezado:</strong></p>
        <code style="display: block; background: white; padding: 10px; border-radius: 4px; font-size: 0.85rem;">
nombre,email,matricula,password,carrera,grupo<br>
Juan Pérez,juan@alumno.com,2024001,Pass123,Matemáticas,3101TT
        </code>
        
        <p style="margin: 15px 0 5px 0; font-size: 0.9rem;"><strong>Separado por TAB:</strong></p>
        <code style="display: block; background: white; padding: 10px; border-radius: 4px; font-size: 0.85rem;">
Juan Pérez[TAB]juan@alumno.com[TAB]2024001[TAB]Pass123[TAB]Matemáticas[TAB]3101TT
        </code>
        
        <p style="margin: 15px 0 5px 0; color: #666; font-size: 0.85rem;">
          • La <strong>matrícula</strong> debe ser única<br>
          • El campo <strong>carrera</strong> debe coincidir con una carrera existente<br>
          • El campo <strong>grupo</strong> debe existir en el sistema<br>
          • Los alumnos se crearán solo en Firestore (NO en Authentication)
        </p>
      </div>
      
      <div class="form-grupo">
        <label>Seleccionar archivo CSV:</label>
        <input type="file" id="archivoCSVAlumnos" accept=".csv,.txt" 
               style="width: 100%; padding: 10px; border: 2px dashed #ddd; border-radius: 8px;">
      </div>
      
      <div id="previewCSVAlumnos" style="display: none; margin-top: 20px;">
        <h4>Vista Previa:</h4>
        <div id="contenidoPreviewAlumnos" style="max-height: 400px; overflow-y: auto; 
                                          border: 1px solid #ddd; padding: 10px; 
                                          border-radius: 5px; background: #fafafa;">
        </div>
        <div id="estadisticasAlumnos" style="margin-top: 15px; padding: 10px; 
                                      background: #f5f5f5; border-radius: 5px;">
        </div>
      </div>
      
      <div class="form-botones" style="margin-top: 20px;">
        <button id="btnProcesarCSVAlumnos" onclick="procesarCSVAlumnos()" class="btn-guardar" style="display: none;">
          ✅ Cargar Alumnos
        </button>
        <button type="button" onclick="cerrarModal()" class="btn-cancelar">❌ Cancelar</button>
      </div>
    </div>
  `;
  
  document.getElementById('contenidoModal').innerHTML = html;
  document.getElementById('modalGenerico').style.display = 'block';
  
  document.getElementById('archivoCSVAlumnos').addEventListener('change', leerArchivoCSVAlumnos);
}

let datosCSVAlumnosParsed = [];

async function leerArchivoCSVAlumnos(event) {
  const archivo = event.target.files[0];
  if (!archivo) return;
  
  const reader = new FileReader();
  
  reader.onload = async function(e) {
    const texto = e.target.result;
    
    const tieneTabs = texto.includes('\t');
    const separador = tieneTabs ? '\t' : ',';
    
    const lineas = texto.trim().split('\n');
    const datos = [];
    
    // Detectar encabezado
    const primeraLinea = lineas[0].toLowerCase();
    if (primeraLinea.includes('nombre') && primeraLinea.includes('email')) {
      lineas.shift();
    }
    
    lineas.forEach((linea, index) => {
      linea = linea.trim();
      if (!linea) return;
      
      const campos = linea.split(separador).map(c => c.trim());
      
      if (campos.length >= 4) {
        datos.push({
          linea: index + 1,
          nombre: campos[0] || '',
          email: campos[1] || '',
          matricula: campos[2] || '',
          password: campos[3] || '',
          carreraNombre: campos[4] || '',
          grupoNombre: campos[5] || ''
        });
      }
    });
    
    datosCSVAlumnosParsed = datos;
    await mostrarPreviewCSVAlumnos(datos);
  };
  
  reader.readAsText(archivo, 'UTF-8');
}

async function mostrarPreviewCSVAlumnos(datos) {
  if (datos.length === 0) {
    alert('❌ El archivo está vacío o no tiene el formato correcto');
    return;
  }
  
  const carrerasMap = await obtenerMapaCarrerasInverso();
  const gruposMap = await obtenerMapaGruposInverso();
  
  let validos = 0;
  let errores = 0;
  let html = '<table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">';
  html += '<tr style="background: #f0f0f0; font-weight: bold;">';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Estado</th>';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Nombre</th>';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Email</th>';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Matrícula</th>';
  html += '<th style="padding: 8px; border: 1px solid #ddd;">Grupo</th>';
  html += '</tr>';
  
  datos.forEach(dato => {
    let estado = '✅';
    let errorMsg = '';
    let esValido = true;
    
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
    
    if (!dato.matricula) {
      estado = '❌';
      errorMsg += 'Sin matrícula. ';
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
    } else if (!carrerasMap[dato.carreraNombre.toLowerCase()]) {
      estado = '❌';
      errorMsg += `Carrera "${dato.carreraNombre}" no existe. `;
      esValido = false;
    }
    
    if (!dato.grupoNombre) {
      estado = '❌';
      errorMsg += 'Grupo requerido. ';
      esValido = false;
    } else if (!gruposMap[dato.grupoNombre.toLowerCase()]) {
      estado = '❌';
      errorMsg += `Grupo "${dato.grupoNombre}" no existe. `;
      esValido = false;
    }
    
    dato.valido = esValido;
    dato.carreraId = carrerasMap[dato.carreraNombre.toLowerCase()] || usuarioActual.carreraId;
    dato.grupoId = gruposMap[dato.grupoNombre.toLowerCase()] || null;
    
    if (esValido) validos++;
    else errores++;
    
    const colorFila = esValido ? '#f1f8e9' : '#ffebee';
    
    html += `<tr style="background: ${colorFila};">`;
    html += `<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${estado}</td>`;
    html += `<td style="padding: 8px; border: 1px solid #ddd;">${dato.nombre}</td>`;
    html += `<td style="padding: 8px; border: 1px solid #ddd;">${dato.email}</td>`;
    html += `<td style="padding: 8px; border: 1px solid #ddd;">${dato.matricula}</td>`;
    html += `<td style="padding: 8px; border: 1px solid #ddd;">${dato.grupoNombre || 'N/A'}${errorMsg ? '<br><small style="color: red;">' + errorMsg + '</small>' : ''}</td>`;
    html += '</tr>';
  });
  
  html += '</table>';
  
  document.getElementById('contenidoPreviewAlumnos').innerHTML = html;
  
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
  
  document.getElementById('estadisticasAlumnos').innerHTML = stats;
  document.getElementById('previewCSVAlumnos').style.display = 'block';
  
  if (validos > 0) {
    document.getElementById('btnProcesarCSVAlumnos').style.display = 'inline-block';
    document.getElementById('btnProcesarCSVAlumnos').textContent = 
      errores > 0 ? `✅ Cargar ${validos} Válidos (Omitir ${errores})` : `✅ Cargar ${validos} Alumnos`;
  }
}

async function obtenerMapaGruposInverso() {
  try {
    const snapshot = await db.collection('grupos').get();
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

async function procesarCSVAlumnos() {
  if (!confirm(`¿Cargar los alumnos válidos?\n\n✅ NO cerrará tu sesión\n📋 Se descargará CSV con credenciales`)) {
    return;
  }
  
  const btnProcesar = document.getElementById('btnProcesarCSVAlumnos');
  btnProcesar.disabled = true;
  btnProcesar.textContent = '⏳ Procesando...';
  
  const datosValidos = datosCSVAlumnosParsed.filter(d => d.valido);
  
  let exitosos = 0;
  let fallidos = 0;
  const erroresDetallados = [];
  const credencialesCreadas = [];
  
  for (const dato of datosValidos) {
    try {
      btnProcesar.textContent = `⏳ Procesando ${exitosos + fallidos + 1}/${datosValidos.length}...`;
      
      // Verificar si el email ya existe
      const existe = await buscarAlumnoPorEmail(dato.email);
      
      if (existe) {
        exitosos++;
        credencialesCreadas.push({
          nombre: dato.nombre,
          email: dato.email,
          matricula: dato.matricula,
          password: dato.password,
          grupo: dato.grupoNombre,
          estado: 'Ya existía'
        });
      } else {
        // Crear nuevo alumno
        await db.collection('usuarios').add({
          nombre: dato.nombre,
          email: dato.email,
          matricula: dato.matricula,
          passwordTemporal: dato.password,
          rol: 'alumno',
          carreraId: dato.carreraId,
          grupoId: dato.grupoId,
          activo: true,
          estado: 'pendiente_registro',
          fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        exitosos++;
        credencialesCreadas.push({
          nombre: dato.nombre,
          email: dato.email,
          matricula: dato.matricula,
          password: dato.password,
          grupo: dato.grupoNombre,
          estado: 'Creado - Pendiente registro'
        });
      }
      
    } catch (error) {
      console.error('Error con', dato.email, error);
      fallidos++;
      erroresDetallados.push(`${dato.nombre}: ${error.message}`);
    }
  }
  
  // Generar CSV
  let csvCredenciales = 'Nombre,Email,Matricula,Password,Grupo,Estado\n';
  credencialesCreadas.forEach(c => {
    csvCredenciales += `"${c.nombre}","${c.email}","${c.matricula}","${c.password}","${c.grupo}","${c.estado}"\n`;
  });
  
  const blob = new Blob([csvCredenciales], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'credenciales-alumnos-' + new Date().toISOString().split('T')[0] + '.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  let mensaje = `✅ Proceso completado:\n\n`;
  mensaje += `• ${exitosos} alumnos procesados\n`;
  if (fallidos > 0) {
    mensaje += `• ${fallidos} con errores\n`;
    mensaje += `Errores: ${erroresDetallados.join(', ')}\n\n`;
  }
  
  mensaje += `\n📥 CSV descargado con credenciales\n\n`;
  mensaje += `📧 Envía a los alumnos el link:\n`;
  mensaje += `${window.location.origin}/registro-alumno.html\n\n`;
  mensaje += `Con sus credenciales del CSV`;
  
  alert(mensaje);
  
  cerrarModal();
  cargarAlumnos();
}

async function buscarAlumnoPorEmail(email) {
  try {
    const snapshot = await db.collection('usuarios')
      .where('email', '==', email)
      .where('rol', '==', 'alumno')
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