let alumnosData = [];

async function cargarDatos() {
  try {
    const response = await fetch('personas.json');
    const data = await response.json();

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
        <th>ID</th>
        <th>Nombre</th>
        <th>Grupo</th>
        <th>Actividad 1</th>
        <th>Actividad 2</th>
        <th>Actividad 3</th>
        <th>Promedio</th>
      </tr>
  `;

  alumnos.forEach(alumno => {
    const a1 = parseFloat(alumno.actividad1);
    const a2 = parseFloat(alumno.actividad2);
    const a3 = parseFloat(alumno.actividad3);
    const promedio = ((a1 + a2 + a3) / 3).toFixed(2);

    tabla += `
      <tr>
        <td>${alumno.id}</td>
        <td>${alumno.nombre}</td>
        <td>${alumno.grupoNum}${alumno.grupoSig}</td>
        <td>${alumno.actividad1}</td>
        <td>${alumno.actividad2}</td>
        <td>${alumno.actividad3}</td>
        <td>${promedio}</td>
      </tr>
    `;
  });

  tabla += "</table>";
  document.getElementById("personas").innerHTML = tabla;
}

// cargar al iniciar
cargarDatos();
