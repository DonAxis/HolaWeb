const Califica = [
  { pagina: "https://danaromero960120.github.io/holaWeb/examen.html", evaluacion: "examen", nombre: "Dana" , califica:"6.575" },
  { pagina: "https://evelyndominguez-oss.github.io/HolaWeb/examen.html", evaluacion: "examen", nombre: "Vanesa" , califica:"7.62" },
  { pagina: "https://yoramruiz-sys.github.io/HolaWeb/examen.html", evaluacion: "examen", nombre: "Yoram" , califica:"4.0 <10% IA " },
  { pagina: "https://t3lacomex.github.io/Holaweb/Examen.html", evaluacion: "examen", nombre: "Franco" , califica:"6.8 30% IA" },
  { pagina: "https://github.com/Moises8907/examen/tree/main", evaluacion: "examen", nombre: "Moises" , califica:"55% a 82% IA" },
  { pagina: "https://barullada245-web.github.io/HolaWeb/Examen.html", evaluacion: "examen", nombre: "Bryan" , califica:"3.8" },
  { pagina: "https://valbenitezs1216.github.io/holaWeb/ExamenP2.html", evaluacion: "examen", nombre: "Valentina" , califica:"7.85" },
  { pagina: "https://fatimadiaz-spec.github.io/HolaWeb/faty.html", evaluacion: "examen", nombre: "Fatima" , califica:"6.7" },
  { pagina: "https://wakanda9715.github.io/HolaWeb/examen.html", evaluacion: "examen", nombre: "Wakanda" , califica:"5.725" },
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
    tabla += `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.evaluacion}</td>
        <td>
            <a href="${p.pagina}">  ${p.pagina} </a>
        </td>
        <td id="cali">${p.califica} </td>
      </tr>
    `;
  }
  
  tabla += "</table>";
  document.getElementById("alumnos").innerHTML = tabla;
}

mostrarProductos(Califica);