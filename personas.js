let alumnosData = [];

async function cargarDatos() {
  try {
    const response = await fetch('personas.json');
    const data = await response.json();

    // 👇 aquí está la clave correcta del JSON
    alumnosData = data.alumnos;

    mostrarTabla(alumnosData);
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    document.getElementById("personas").innerHTML =
      '<p style="color:red;">No se pudo cargar el archivo JSON</p>';
  }
}

function mostrarTabla(alumnos) {
  let tabla = `
    <table border="1">
      <tr>
        <th>Nombre</th>
        <th>GitHub</th>
        <th>Canva</th>
        <th>Git</th>
        <th>Canva</th>
        <th>Proyecto</th>
        <th>Examen</th>
        <th>Evaluación</th>
      </tr>
  `;

  alumnos.forEach(alumno => {
    const cal = alumno.calificaciones;

    tabla += `
      <tr>
        <td>${alumno.nombre}</td>
        <td>
          <a href="${alumno.pagina}" target="_blank">
            ${alumno.pagina ? "Ver" : "No hay"}
          </a>
        </td>
        <td>
          <a href="${alumno.paginaCanva}" target="_blank">
            ${alumno.paginaCanva ? "Ver" : "No hay"}
          </a>
        </td>
        <td>${cal.calificaGit}</td>
        <td>${cal.calificaC}</td>
        <td>${cal.proyect}</td>
        <td>${cal.examen}</td>
        <td>${cal.ev}</td>
      </tr>
    `;
  });

  tabla += "</table>";
  document.getElementById("personas").innerHTML = tabla;
}

// cargar al iniciar
cargarDatos();
