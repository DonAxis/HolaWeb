const Califica = [
  { pagina: "https://danaromero960120.github.io/holaWeb/dreams.html", evaluacion: "examenF", nombre: "Dana" , califica:"¿font" },
  { pagina: "https://github.com/evelyndominguez-oss", evaluacion: "examenF", nombre: "Vanesa" , califica:"N" },
  { pagina: "https://github.com/yoramruiz-sys", evaluacion: "examenF", nombre: "Yoram" , califica:"N" },
  { pagina: "https://github.com/T3laComex", evaluacion: "examenF", nombre: "Franco" , califica:"N" },
  { pagina: "https://github.com/Moises8907", evaluacion: "examenF", nombre: "Moises" , califica:"N" },
  { pagina: "https://github.com/barullada245-web", evaluacion: "examenF", nombre: "Bryan" , califica:"N" },
  { pagina: "https://github.com/valbenitezs1216", evaluacion: "examenF", nombre: "Valentina" , califica:"N" },
  { pagina: "https://github.com/fatimadiaz-spec", evaluacion: "examenF", nombre: "Fatima" , califica:"N" },
  { pagina: "https://github.com/wakanda9715", evaluacion: "examenF", nombre: "Wakanda" , califica:"N" },
];


function mostrarProductos(arreglo) {
  let tabla = `
    <table border="1">
      <tr>
        <th>Nombre</th>
        <th>Evaluación</th>
        <th>Página</th>
        <th >Calificacion Examen</th>
      </tr>
  `;
  
  for (let p of arreglo) {
    let color = "black";
    if(p.califica.includes("IA")){
      color="red";
    }

    tabla += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.evaluacion}</td>
        <td>
            <a href="${p.pagina}">  ${p.pagina} </a>
        </td>
        <td style="color: ${color}">${p.califica}</td>
      </tr>
    `;
  }
  
  tabla += "</table>";
  document.getElementById("alumnos").innerHTML = tabla;
}

mostrarProductos(Califica);