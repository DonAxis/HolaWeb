
    const Califica = [
      {
        nombre: "Dana",
        pagina: "https://danaromero960120.github.io/holaWeb/dreams.html",
        paginaCanva: "https://www.canva.com/design/DAG7IMxAW0o/L3pVUYwiSMYlj3M7GUul3w/edit",
        calificaGit: "",
        calificaC: "",
        proyect: ""
      },
      {
        nombre: "Vanesa",
        pagina: "https://evelyndominguez-oss.github.io/HolaWeb/",
        paginaCanva: "",
        calificaGit: "",
        calificaC: "N",
        proyect: ""
      },
      {
        nombre: "Yoram",
        pagina: "https://github.com/yoramruiz-sys",
        paginaCanva: "https://estampaloka.my.canva.site/",
        calificaGit: "N",
        calificaC: "",
        proyect: ""
      },
      {
        nombre: "Franco",
        pagina: "https://t3lacomex.github.io/Camaron/",
        paginaCanva: "https://lacuevadelcamaron.my.canva.site/",
        calificaGit: "",
        calificaC: "",
        proyect: ""
      },
      {
        nombre: "Moises",
        pagina: "https://github.com/Moises8907",
        paginaCanva: "https://www.figma.com/make/UMPNM5476rQfOhwWRcpCzV/",
        calificaGit: "N",
        calificaC: "",
        proyect: ""
      },
      {
        nombre: "Bryan",
        pagina: "https://barullada245-web.github.io/HolaWeb/",
        paginaCanva: "https://www.canva.com/design/DAG6ar3yit8/Vjc6vQe48Um9Ebx_YKD1Sg/edit",
        calificaGit: "",
        calificaC: "",
        proyect: ""
      },
      {
        nombre: "Valentina",
        pagina: "https://valbenitezs1216.github.io/ExamenP3/",
        paginaCanva: "",
        calificaGit: "gráfic vector 15",
        calificaC: "",
        proyect: ""
      }
    ];

    // ====== FUNCIÓN PARA MOSTRAR TABLA ======
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
          </tr>
        `;
      });

      tabla += "</table>";
      document.getElementById("alumnos").innerHTML = tabla;
    }

    // ====== EJECUCIÓN ======
    mostrarTabla(Califica);
