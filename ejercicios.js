const productos = [
  { nombre: "compu", precio: 15000, categoria: "tecnologia" },
  { nombre: "Mouse", precio: 300, categoria: "tecnologia" },
  { nombre: "Teclado", precio: 800, categoria: "tecnologia" },
  { nombre: "Monitor", precio: 4500, categoria: "tecnologia" },
  { nombre: "Auriculares", precio: 1200, categoria: "tecnologia" },
  { nombre: "Router", precio: 2000, categoria: "tecnologia" },
  { nombre: "telefono", precio: 8000, categoria: "tecnologia" },
  { nombre: "SillaGamer", precio: 3500, categoria: "muebles" },
  { nombre: "tenis", precio: 2000, categoria: "ropa" },
  { nombre: "Escritorio", precio: 4000, categoria: "muebles" },
  { nombre: "blusa", precio: 500, categoria: "ropa" },
  { nombre: "Cafetera", precio: 1800, categoria: "cafe" },
  { nombre: "CamisaGodin", precio: 100, categoria: "ropa" },
  { nombre: "Pantalon", precio: 1200, categoria: "ropa" },
  { nombre: "taza", precio: 300, categoria: "cafe" }
];

//espera a que la pagina cargue
document.addEventListener("DOMContentLoaded", () => {  
      const eje1 = document.getElementById("eje1"); //toma boton
      const resul = document.getElementById("resultado"); //toma el text resultado
  eje1.addEventListener("click", () => {
   
    const resultado = productos
      .filter(p => p.categoria === "tecnologia")
      .sort((a, b) => a.precio - b.precio)
      .map(p => p.nombre)
      .join(" + ");

    resul.textContent = "Quedaria:\n" + resultado;
  });
});


/*

const resultado = productos
    .filter(p => p.categoria === "tecnologia")
    .sort((a, b) => a.precio - b.precio)
    .map(p => p.nombre)
  .join(" > ");
console.warn("Productos de tecnología ordenados por precio:", resultado);
 document.getElementById("resultado").textContent = "Productos tecnología ordenados por precio:\n" + resultado;
*/