
    const Califica = [
      {
        nombre: "Dana",
        pagina: "https://danaromero960120.github.io/holaWeb/dreams.html",
        paginaCanva: "https://www.canva.com/design/DAG7IMxAW0o/L3pVUYwiSMYlj3M7GUul3w/edit",
        calificaGit: "10",
        calificaC: "10",
        proyect: "8",
        examen:"4.5",
        ev:"8"

      },
      {
        nombre: "Vanesa",
        pagina: "https://evelyndominguez-oss.github.io/HolaWeb/",
        paginaCanva: "https://www.canva.com/design/DAG6AnzEgPk/5x99ee5lp3qtWjZE715NWg/edit",
        calificaGit: "10",
        calificaC: "10",
        proyect: "7",
        examen:"3.5",
        ev:"8"
      },
      {
        nombre: "Yoram",
        pagina: "https://yoramruiz-sys.github.io/MiPaginaWeb/",
        paginaCanva: "https://estampaloka.my.canva.site/",
        calificaGit: "3GPT",
        calificaC: "7",
        proyect: "6",
        examen:"2.5",
        ev:"2"
      },
      {
        nombre: "Franco",
        pagina: "https://t3lacomex.github.io/Camaron/",
        paginaCanva: "https://lacuevadelcamaron.my.canva.site/",
        calificaGit: "3GPT",
        calificaC: "9",
        proyect: "6",
        examen:"3",
        ev:"4"
      },
      {
        nombre: "Moises",
        pagina: "https://github.com/Moises8907",
        paginaCanva: "https://www.figma.com/make/UMPNM5476rQfOhwWRcpCzV/",
        calificaGit: "3N",
        calificaC: "9",
        proyect: "8",
        examen:"5.5",
        ev:"0"
      },
      {
        nombre: "Bryan",
        pagina: "https://barullada245-web.github.io/HolaWeb/",
        paginaCanva: "https://www.canva.com/design/DAG6ar3yit8/Vjc6vQe48Um9Ebx_YKD1Sg/edit",
        calificaGit: "9",
        calificaC: "9",
        proyect: "7",
        examen:"3.5",
        ev:"7"
      },
      {
        nombre: "Valentina",
        pagina: "https://valbenitezs1216.github.io/ExamenP3/",
        paginaCanva: "",
        calificaGit: "8GPT",
        calificaC: "0",
        proyect: "10",
        examen:"7",
        ev:"8"
      }
    ];

 
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

      alumnos.forEach(a => {
        tabla += `
          <tr>
            <td>${a.nombre ?? "-"}</td>

            <td>
              <a href="${a.pagina ?? '#'}" target="_blank"> ${a.pagina ? "Github" : "No encontre"} 
            </td>
            <td>
              <a href="${a.paginaCanva ?? '#'}" target="_blank"> ${a.paginaCanva ? "Canva" : "No encontre"} 
            </td>
            <td>${a.calificaGit || "P"}</td>
            <td>${a.calificaC || "P"}</td>
            <td>${a.proyect || "P"}</td>
            <td style="background-color: yellow;">${calcularPromedio(a)}</td>
          <td style="background-color: yellow;">${a.examen || "P"}</td>
          <td style="background-color: yellow;">${a.ev || "P"}</td>
          <td style="background-color: #92BFD6;">${calcularPromedio2(a)}</td>
          </tr>
        `;
      });

      tabla += "</table>";
      document.getElementById("alumnos").innerHTML = tabla;
    }

    

    mostrarTabla(Califica); ///aqui imprime




function calcularPromedio(a) {
  function nota(n) {
    if (typeof n === "string") {
      const num = parseFloat(n);  
      return isNaN(num) ? 0 : num;
    }
    return Number(n) || 0;
  }

  const git = nota(a.calificaGit);
  const c = nota(a.calificaC);
  const proyecto = nota(a.proyect);

  return ((git + c + proyecto) / 3).toFixed(1);
}

function calcularPromedio2(a) {
  function nota(n) {
    if (typeof n === "string") {
      const num = parseFloat(n);
      return isNaN(num) ? 0 : num;
    }
    return Number(n) || 0;
  }

  const proyect = Number(calcularPromedio(a)) || 0; 
  const examen = nota(a.examen);
  const ev = nota(a.ev);

  return ((proyect + examen + ev) / 3).toFixed(1);
}
