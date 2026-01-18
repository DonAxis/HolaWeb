// ===== GENERADOR DE PDF HISTORIAL DE ALUMNO =====
// Para Panel de Coordinador
// Uso: descargarHistorialAlumnoPDF(alumnoId, nombreAlumno)

async function descargarHistorialAlumnoPDF(alumnoId, nombreAlumno) {
  try {
    // Verificar que jsPDF este cargado
    if (typeof window.jspdf === 'undefined') {
      alert('Error: jsPDF no esta cargado. Recarga la pagina.');
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Obtener calificaciones del alumno
    const calificaciones = await db.collection('calificaciones')
      .where('alumnoId', '==', alumnoId)
      .get();
    
    if (calificaciones.empty) {
      alert('Este alumno no tiene calificaciones registradas');
      return;
    }
    
    // Construir mapa de materias con cache
    const materiasMap = {};
    const materiasCache = {};
    
    for (const calDoc of calificaciones.docs) {
      const cal = calDoc.data();
      const key = `${cal.materiaId}_${cal.periodo}`;
      
      let materiaNombre = cal.materiaNombre || 'Sin nombre';
      let materiaCodigo = cal.materiaCodigo || '';
      
      if (!cal.materiaNombre && cal.materiaId) {
        if (!materiasCache[cal.materiaId]) {
          try {
            const materiaDoc = await db.collection('materias').doc(cal.materiaId).get();
            if (materiaDoc.exists) {
              materiasCache[cal.materiaId] = materiaDoc.data();
            }
          } catch (error) {
            console.error('Error al cargar materia:', error);
          }
        }
        
        if (materiasCache[cal.materiaId]) {
          materiaNombre = materiasCache[cal.materiaId].nombre;
          materiaCodigo = materiasCache[cal.materiaId].codigo || '';
        }
      }
      
      materiasMap[key] = {
        materiaNombre: materiaNombre,
        materiaCodigo: materiaCodigo,
        periodo: cal.periodo || 'N/A',
        parcial1: cal.parciales?.parcial1 ?? '-',
        parcial2: cal.parciales?.parcial2 ?? '-',
        parcial3: cal.parciales?.parcial3 ?? '-'
      };
    }
    
    // Fecha actual
    const fecha = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Agregar logos si existe la funcion
    if (typeof logosEscuela !== 'undefined' && typeof logosEscuela.agregarLogosAlPDF === 'function') {
      logosEscuela.agregarLogosAlPDF(doc);
    }
    
    // Encabezado
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL ACADEMICO', pageWidth / 2, 25, { align: 'center' });
    
    // Linea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 30, pageWidth - 20, 30);
    
    // Informacion del alumno
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    let y = 40;
    
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
          const carreraDoc = await db.collection('carreras').doc(alumno.carreraId).get();
          if (carreraDoc.exists) {
            doc.text(`Carrera: ${carreraDoc.data().nombre}`, 20, y);
            y += 7;
          }
        }
        
        if (alumno.grupoId) {
          const grupoDoc = await db.collection('grupos').doc(alumno.grupoId).get();
          if (grupoDoc.exists) {
            doc.text(`Grupo: ${grupoDoc.data().nombre}`, 20, y);
            y += 7;
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del alumno:', error);
    }
    
    y += 5;
    
    // Agrupar materias por periodo
    const periodos = {};
    
    Object.values(materiasMap).forEach(materia => {
      const periodo = materia.periodo || 'N/A';
      if (!periodos[periodo]) {
        periodos[periodo] = [];
      }
      periodos[periodo].push(materia);
    });
    
    // Ordenar periodos
    const periodosOrdenados = Object.keys(periodos).sort().reverse();
    
    // Generar tabla por cada periodo
    for (let i = 0; i < periodosOrdenados.length; i++) {
      const periodo = periodosOrdenados[i];
      const materias = periodos[periodo];
      
      // Verificar espacio en la pagina
      if (i > 0 && y > pageHeight - 80) {
        doc.addPage();
        y = 20;
      }
      
      // Titulo del periodo
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(102, 126, 234);
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
          p1,
          p2,
          p3,
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
          fillColor: [102, 126, 234],
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
    
    console.log('PDF generado:', nombreArchivo);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar PDF: ' + error.message);
  }
}

console.log('Funcion descargarHistorialAlumnoPDF cargada');