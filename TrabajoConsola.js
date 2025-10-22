var datos=["casa","lapiz","estudiante","color"];

function prueba1(){
    console.log ("datos: " +datos);
}

prueba1();

datos.forEach(function(elemento){
    console.log (datos);
});

datos.forEach(function(elemento){
    console.log (elemento);
});

var coche={
    marca: "ford",
    motor: "electrioc",
    acelerar: function(){
        console.log("amonos");
    }
};

coche.acelerar();
console.log(coche.marca);

//dom es el documento HTML y se usa con document
var elDom = document.querySelector("h1");
elDom.textContent ="ahora ya cambia x2";

//evento susesos como dar click cualquier cosa
// listener escucha o recibe los datos

function Colorea(){
    this.classList.toggle("cambia");
    console.log("ajam");
    elDom.textContent ="uwu";

}
document.querySelector("body").addEventListener("click", Colorea);

