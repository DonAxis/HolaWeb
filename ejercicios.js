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
  { nombre: "taza", precio: 300, categoria: "cafe" },
  { nombre: "compu", precio: 15000, catalogo: "tecnologia" },
{ nombre: "mini panditas", precio:10 , catalogo: "dulces" },
{ nombre: "vivo V50", precio: 5000, catalogo: "tecnologia" },
{ nombre: "zapatos", precio: 1400, catalogo: "calzado" },
{ nombre: "laptop HP", precio: 18000, catalogo: "tecnologia" },
{ nombre: "mouse gamer", precio: 450, catalogo: "tecnologia" },
{ nombre: "teclado", precio: 1200, catalogo: "tecnologia" },
{ nombre: "audifonos bluetooth", precio: 800, catalogo: "tecnologia" },
{ nombre: "monitor Samsung", precio: 3500, catalogo: "tecnologia" },
{ nombre: "taza", precio: 120, catalogo: "hogar" },
{ nombre: "mochila", precio: 600, catalogo: "accesorios" },
{ nombre: "libreta", precio: 80, catalogo: "papeleria" },
{ nombre: "pelota", precio: 250, catalogo: "deportes" },
{ nombre: "reloj", precio: 900, catalogo: "moda" },
{ nombre: "Compu", precio: 15000, tipo: "tecnologia" },
  { nombre: "Pecocitas", precio: 3, tipo: "dulces" },
  { nombre: "Vivo V50", precio: 5000, tipo: "tecnologia" },
  { nombre: "Zapatos", precio: 1400, tipo: "calzado" },
  { nombre: "Tablet", precio: 8000, tipo: "tecnologia" },
  { nombre: "Smartphone", precio: 6000, tipo: "tecnologia" },
  { nombre: "Monitor", precio: 7000, tipo: "tecnologia" },
  { nombre: "Auriculares", precio: 1200, tipo: "tecnologia" },
  { nombre: "Disco Duro", precio: 2500, tipo: "tecnologia" },
  { nombre: "Libro", precio: 200, tipo: "papeleria" },
  { nombre: "Camisa", precio: 600, tipo: "ropa" },
  { nombre: "Mueble", precio: 4500, tipo: "hogar" },
  { nombre: "Juguete", precio: 350, tipo: "niños" },
  { nombre: "Lámpara", precio: 900, tipo: "hogar" },
     { nombre: "compu", precio: 15000, catalogo: "tecnologia" },
    { nombre: "pocoritos", precio: 3, catalogo: "dulces" },
    { nombre: "vivo V50", precio: 5000, catalogo: "tecnologia" },
    { nombre: "zapatos", precio: 1400, catalogo: "calzado" },
   { nombre: "mouse inalambrico", precio: 350, catalogo: "tecnologia" },
    { nombre: "monitor 27", precio: 4500, catalogo: "tecnologia" },
    { nombre: "teclado mecanico", precio: 800, catalogo: "tecnologia" },
    { nombre: "audifonos BT", precio: 600, catalogo: "tecnologia" },
    { nombre: "disco duro ext.", precio: 1200, catalogo: "tecnologia" },
   { nombre: "cuaderno prof.", precio: 65, catalogo: "papeleria" },
    { nombre: "pluma gel", precio: 20, catalogo: "belleza" },
    { nombre: "botella agua", precio: 150, catalogo: "liquidos" },
    { nombre: "pilas AA (4)", precio: 50, catalogo: "tecnologia" },
    { nombre: "cargador portatil", precio: 400, catalogo: "tecnologia" }
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
