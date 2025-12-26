// hay que traer el alumnos.JSON y pongo en "alumnosData[]"
let alumnosData = [];

// Función para cargar los datos desde el JSON
async function cargarDatos() {
  try {
    const response = await fetch('alumnos.json');
    const data = await response.json();
    alumnosData = data.alumnos;
    mostrarTabla(alumnosData);
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    document.getElementById("alumnos").innerHTML = 
      '<p style="color: red;">Error el ".json" no aparece o no existe.</p>';
  }
}

function mostrarTabla(alumnos) {
  let tabla = `
    <table>
      <tr>
        <th>Nombre</th>
        <th>Pagina Git</th>
        <th>Pagina Canva</th>
        <th>Ev. Git</th>
        <th>Ev. Canva</th>
        <th>Ev. compara</th>
        <th style="background-color: yellow;">TotalProyecto</th>
        <th style="background-color: yellow;">Examen</th>
        <th style="background-color: yellow;">EvaluaC</th>
        <th style="background-color: #92BFD6;">Final</th>
      </tr>
  `;

  alumnos.forEach(alumno => {
    const cal = alumno.calificaciones;
    
    tabla += `
      <tr>
        <td>${alumno.nombre ?? "-"}</td>
        <td>
          <a href="${alumno.pagina ?? '#'}" target="_blank">
            ${alumno.pagina ? "Github" : "No encontre"}
          </a>
        </td>
        <td>
          <a href="${alumno.paginaCanva ?? '#'}" target="_blank">
            ${alumno.paginaCanva ? "Canva" : "No encontre"}
          </a>
        </td>
        <td>${cal.calificaGit || "P"}</td>
        <td>${cal.calificaC || "P"}</td>
        <td>${cal.proyect || "P"}</td>
        <td style="background-color: yellow;">${calcularPromedio(cal)}</td>
        <td style="background-color: yellow;">${cal.examen || "P"}</td>
        <td style="background-color: yellow;">${cal.ev || "P"}</td>
        <td style="background-color: #92BFD6;">${calcularPromedio2(cal)}</td>
      </tr>
    `;
  });

  tabla += "</table>";
  document.getElementById("alumnos").innerHTML = tabla;
}

// Función para calcular promedio del proyecto
function calcularPromedio(cal) {
  function nota(n) {
    if (typeof n === "string") {
      const num = parseFloat(n);
      return isNaN(num) ? 0 : num;
    }
    return Number(n) || 0;
  }

  const git = nota(cal.calificaGit);
  const c = nota(cal.calificaC);
  const proyecto = nota(cal.proyect);

  return ((git + c + proyecto) / 3).toFixed(1);
}

// Función para calcular promedio final
function calcularPromedio2(cal) {
  function nota(n) {
    if (typeof n === "string") {
      const num = parseFloat(n);
      return isNaN(num) ? 0 : num;
    }
    return Number(n) || 0;
  }

  const proyect = Number(calcularPromedio(cal)) || 0;
  const examen = nota(cal.examen);
  const ev = nota(cal.ev);

  return ((proyect + examen + ev) / 3).toFixed(1);
}

// Cargar datos cuando la página esté lista
cargarDatos();






