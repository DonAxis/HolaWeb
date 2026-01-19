// ===== NUEVA FUNCIÓN: Descargar PDF del historial del alumno =====
async function descargarHistorialAlumnoPDF(alumnoId, nombreAlumno) {
  try {
    console.log('INICIANDO generacion de PDF para alumno:', alumnoId, nombreAlumno);
    
    // Verificar que jsPDF este cargado
    if (typeof window.jspdf === 'undefined') {
      alert('Error: jsPDF no esta cargado. Recarga la pagina.');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Obtener calificaciones del alumno DIRECTAMENTE desde Firebase
    console.log('Consultando calificaciones en Firebase...');
    const calificaciones = await db.collection('calificaciones')
      .where('alumnoId', '==', alumnoId)
      .get();
    
    console.log('Calificaciones encontradas:', calificaciones.size);
    
    if (calificaciones.empty) {
      alert('Este alumno no tiene calificaciones registradas');
      return;
    }
    
    // Construir mapa de materias con cache
    const materiasMapPDF = {};
    const materiasCachePDF = {};
    
    console.log('Procesando calificaciones...');
    for (const calDoc of calificaciones.docs) {
      const cal = calDoc.data();
      const key = `${cal.materiaId}_${cal.periodo}`;
      
      let materiaNombre = cal.materiaNombre || 'Sin nombre';
      let materiaCodigo = cal.materiaCodigo || '';
      
      // Si no tiene nombre, buscarlo en la coleccion materias
      if (!cal.materiaNombre && cal.materiaId) {
        if (!materiasCachePDF[cal.materiaId]) {
          try {
            const materiaDoc = await db.collection('materias').doc(cal.materiaId).get();
            if (materiaDoc.exists) {
              materiasCachePDF[cal.materiaId] = materiaDoc.data();
              console.log('Materia cargada:', cal.materiaId, materiasCachePDF[cal.materiaId].nombre);
            }
          } catch (error) {
            console.error('Error al cargar materia:', error);
          }
        }
        
        if (materiasCachePDF[cal.materiaId]) {
          materiaNombre = materiasCachePDF[cal.materiaId].nombre;
          materiaCodigo = materiasCachePDF[cal.materiaId].codigo || '';
        }
      }
      
      materiasMapPDF[key] = {
        materiaNombre: materiaNombre,
        materiaCodigo: materiaCodigo,
        periodo: cal.periodo || 'N/A',
        parcial1: cal.parciales?.parcial1 ?? '-',
        parcial2: cal.parciales?.parcial2 ?? '-',
        parcial3: cal.parciales?.parcial3 ?? '-'
      };
    }
    
    console.log('Materias procesadas:', Object.keys(materiasMapPDF).length);
    
    // Verificar que hay materias
    if (Object.keys(materiasMapPDF).length === 0) {
      alert('No se pudieron procesar las calificaciones');
      return;
    }
    
    // Fecha actual
    const fecha = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // ===== CORRECCION DE LOGOS =====
    // Agregar logos si existen
    if (typeof logosEscuela !== 'undefined') {
      console.log('Objeto logosEscuela encontrado');
      
      // Verificar si existe la funcion agregarLogosAlPDF (version 1)
      if (typeof agregarLogosAlPDF === 'function') {
        console.log('Usando funcion agregarLogosAlPDF');
        agregarLogosAlPDF(doc);
      } 
      // O si esta como metodo del objeto (version 2)
      else if (typeof logosEscuela.agregarLogosAlPDF === 'function') {
        console.log('Usando logosEscuela.agregarLogosAlPDF');
        logosEscuela.agregarLogosAlPDF(doc);
      }
      // O agregar logos manualmente desde el objeto
      else if (logosEscuela.logoIzquierdo || logosEscuela.logoDerecho) {
        console.log('Agregando logos manualmente desde objeto logosEscuela');
        
        try {
          // Logo izquierdo
          if (logosEscuela.logoIzquierdo) {
            doc.addImage(logosEscuela.logoIzquierdo, 'PNG', 15, 8, 25, 15);
            console.log('Logo izquierdo agregado');
          }
        } catch (e) {
          console.log('Error al cargar logo izquierdo:', e);
        }
        
        try {
          // Logo derecho
          if (logosEscuela.logoDerecho) {
            doc.addImage(logosEscuela.logoDerecho, 'PNG', pageWidth - 40, 8, 25, 15);
            console.log('Logo derecho agregado');
          }
        } catch (e) {
          console.log('Error al cargar logo derecho:', e);
        }
      } else {
        console.log('logosEscuela existe pero no tiene logos o funcion');
      }
    } else {
      console.log('No se encontro objeto logosEscuela');
    }
    // ===== FIN CORRECCION DE LOGOS =====
    
    // Encabezado
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL ACADEMICO', pageWidth / 2, 25, { align: 'center' });
    
    // Linea separadora
    doc.setLineWidth(0.5);
    doc.line(30, 40, pageWidth - 30, 40);
    
    // Informacion del alumno
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    let y = 50;
    
    doc.text(`Fecha: ${fecha}`, pageWidth - 20, y, { align: 'right' });
    y += 7;
    doc.text(`Alumno: ${nombreAlumno}`, 20, y);
    y += 7;
    
    // Cargar datos adicionales del alumno
    try {
      const alumnoDoc = await db.collection('usuarios').doc(alumnoId).get();
      if (alumnoDoc.exists) {
        const alumno = alumnoDoc.data();
        
        if (alumno.matricula) {
          doc.text(`Matricula: ${alumno.matricula}`, 20, y);
          y += 7;
        }
        
        if (alumno.carreraId) {
          try {
            const carreraDoc = await db.collection('carreras').doc(alumno.carreraId).get();
            if (carreraDoc.exists) {
              doc.text(`Carrera: ${carreraDoc.data().nombre}`, 20, y);
              y += 7;
            }
          } catch (error) {
            console.error('Error al cargar carrera:', error);
          }
        }
        
        if (alumno.grupoId) {
          try {
            const grupoDoc = await db.collection('grupos').doc(alumno.grupoId).get();
            if (grupoDoc.exists) {
              doc.text(`Grupo: ${grupoDoc.data().nombre}`, 20, y);
              y += 7;
            }
          } catch (error) {
            console.error('Error al cargar grupo:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del alumno:', error);
    }
    
    y += 5;
    
    // Agrupar materias por periodo
    const periodosPDF = {};
    
    const materiasArray = Object.values(materiasMapPDF);
    console.log('Materias a procesar:', materiasArray.length);
    
    materiasArray.forEach(materia => {
      const periodo = materia.periodo || 'N/A';
      if (!periodosPDF[periodo]) {
        periodosPDF[periodo] = [];
      }
      periodosPDF[periodo].push(materia);
    });
    
    // Ordenar periodos
    const periodosOrdenados = Object.keys(periodosPDF).sort().reverse();
    console.log('Periodos encontrados:', periodosOrdenados);
    
    if (periodosOrdenados.length === 0) {
      alert('No se encontraron periodos para generar el PDF');
      return;
    }
    
    // Generar tabla por cada periodo
    for (let i = 0; i < periodosOrdenados.length; i++) {
      const periodo = periodosOrdenados[i];
      const materias = periodosPDF[periodo];
      
      console.log(`Procesando periodo ${periodo}: ${materias.length} materias`);
      
      // Verificar espacio en la pagina
      if (i > 0 && y > pageHeight - 80) {
        doc.addPage();
        y = 20;
      }
      
      // Titulo del periodo
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(106, 33, 53);  //color IPN
      doc.text(`Periodo: ${periodo}`, 20, y);
      doc.setTextColor(0, 0, 0);
      y += 8;
      
      // Preparar datos de la tabla
      const tableData = [];
      let sumaPromedios = 0;
      let countPromedios = 0;
      
      materias.forEach(materia => {
        const p1 = materia.parcial1;
        const p2 = materia.parcial2;
        const p3 = materia.parcial3;
        
        // Calcular promedio
        let promedio = '-';
        const tieneNP = p1 === 'NP' || p2 === 'NP' || p3 === 'NP';
        
        if (tieneNP) {
          promedio = '5.0';
          sumaPromedios += 5.0;
          countPromedios++;
        } else {
          const cals = [p1, p2, p3]
            .filter(c => c !== '-' && c !== null && c !== undefined && c !== '')
            .map(c => parseFloat(c))
            .filter(c => !isNaN(c));
          
          if (cals.length > 0) {
            const prom = cals.reduce((a, b) => a + b, 0) / cals.length;
            promedio = prom.toFixed(1);
            sumaPromedios += prom;
            countPromedios++;
          }
        }
        
        tableData.push([
          materia.materiaNombre,
          p1.toString(),
          p2.toString(),
          p3.toString(),
          promedio
        ]);
      });
      
      // Promedio del periodo
      const promedioPeriodo = countPromedios > 0 
        ? (sumaPromedios / countPromedios).toFixed(1) 
        : '-';
      
      // Generar tabla
      doc.autoTable({
        startY: y,
        head: [['Materia', 'P1', 'P2', 'P3', 'Promedio']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [106, 33, 53],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 90 },
          1: { halign: 'center', cellWidth: 20 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 30, fontStyle: 'bold' }
        }
      });
      
      // Actualizar y
      y = doc.lastAutoTable.finalY + 5;
      
      // Promedio del periodo
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Promedio del periodo: ${promedioPeriodo}`, 20, y);
      
      y += 15;
    }
    
    // Pie de pagina
    const numPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= numPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(128);
      doc.text(
        `Pagina ${i} de ${numPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // Nombre del archivo
    const nombreArchivo = `Historial_${nombreAlumno.replace(/\s+/g, '_')}.pdf`;
    
    // Descargar
    doc.save(nombreArchivo);
    
    console.log('PDF generado exitosamente:', nombreArchivo);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    console.error('Stack trace:', error.stack);
    alert('Error al generar PDF: ' + error.message);
  }
}

console.log('Funcion descargarHistorialAlumnoPDF con logos corregida y cargada');