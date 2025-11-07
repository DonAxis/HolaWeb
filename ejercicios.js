const productos = [
{ nombre: "compu", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im1.jpg" },
  { nombre: "Mouse", precio: 300, categoria: "tecnologia", imagen: "imagenes/im2.jpg" },
  { nombre: "Teclado", precio: 800, categoria: "tecnologia", imagen: "imagenes/im3.jpg" },
  { nombre: "Monitor", precio: 4500, categoria: "tecnologia", imagen: "imagenes/im4.jpg" },
  { nombre: "Auriculares", precio: 1200, categoria: "tecnologia", imagen: "imagenes/im5.jpg" },
  { nombre: "Router", precio: 2000, categoria: "tecnologia", imagen: "imagenes/im6.jpg" },
  { nombre: "telefono", precio: 8000, categoria: "tecnologia", imagen: "imagenes/im7.jpg" },
  { nombre: "SillaGamer", precio: 3500, categoria: "muebles", imagen: "imagenes/im8.jpg" },
  { nombre: "tenis", precio: 2000, categoria: "ropa", imagen: "imagenes/im7.jpg" },
  { nombre: "Escritorio", precio: 4000, categoria: "muebles", imagen: "imagenes/im13.jpg" },
  { nombre: "blusa", precio: 500, categoria: "ropa", imagen: "imagenes/im6.jpg" },
  { nombre: "Cafetera", precio: 1800, categoria: "cafe", imagen: "imagenes/im4.jpg" },
  { nombre: "CamisaGodin", precio: 100, categoria: "ropa", imagen: "imagenes/im4.jpg" },
  { nombre: "Pantalon", precio: 1200, categoria: "ropa", imagen: "imagenes/im9.jpg" },
  { nombre: "taza", precio: 300, categoria: "cafe", imagen: "imagenes/im8.jpg" },
  { nombre: "compu", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im4.jpg" },
{ nombre: "mini panditas", precio:10 , categoria: "dulces", imagen: "imagenes/im15.jpg" },
{ nombre: "vivo V50", precio: 5000, categoria: "tecnologia", imagen: "imagenes/im10.jpg" },
{ nombre: "zapatos", precio: 1400, categoria: "calzado", imagen: "imagenes/im11.jpg" },
{ nombre: "laptop HP", precio: 18000, categoria: "tecnologia", imagen: "imagenes/im19.jpg" },
{ nombre: "mouse gamer", precio: 450, categoria: "tecnologia", imagen: "imagenes/im18.jpg" },
{ nombre: "teclado", precio: 1200, categoria: "tecnologia", imagen: "imagenes/im10.jpg" },
{ nombre: "audifonos bluetooth", precio: 800, categoria: "tecnologia", imagen: "imagenes/im17.jpg" },
{ nombre: "monitor Samsung", precio: 3500, categoria: "tecnologia" , imagen: "imagenes/im15.jpg"},
{ nombre: "taza", precio: 120, categoria: "hogar", imagen: "imagenes/im17.jpg"},
{ nombre: "mochila", precio: 600, categoria: "accesorios", imagen: "imagenes/im14.jpg" },
{ nombre: "libreta", precio: 80, categoria: "papeleria", imagen: "imagenes/im15.jpg" },
{ nombre: "pelota", precio: 250, categoria: "deportes", imagen: "imagenes/im18.jpg" },
{ nombre: "reloj", precio: 900, categoria: "moda", imagen: "imagenes/im19.jpg" },
{ nombre: "Compu", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im20.jpg" },
  { nombre: "Pecocitas", precio: 3, categoria: "dulces" , imagen: "imagenes/im21.jpg"},
  { nombre: "Vivo V50", precio: 5000, categoria: "tecnologia", imagen: "imagenes/im22.jpg" },
  { nombre: "Zapatos", precio: 1400, categoria: "calzado" , imagen: "imagenes/im24.jpg"},
  { nombre: "Tablet", precio: 8000, categoria: "tecnologia", imagen: "imagenes/im23.jpg" },
  { nombre: "Smartphone", precio: 6000, categoria: "tecnologia", imagen: "imagenes/im25.jpg" },
  { nombre: "Monitor", precio: 7000, categoria: "tecnologia" , imagen: "imagenes/im21.jpg"},
  { nombre: "Auriculares", precio: 1200, categoria: "tecnologia" , imagen: "imagenes/im23.jpg"},
  { nombre: "Disco Duro", precio: 2500, categoria: "tecnologia", imagen: "imagenes/im21.jpg" },
  { nombre: "Libro", precio: 200, categoria: "papeleria" , imagen: "imagenes/im24.jpg"},
  { nombre: "Camisa", precio: 600, categoria: "ropa", imagen: "imagenes/im25.jpg" },
  { nombre: "Mueble", precio: 4500, categoria: "hogar", imagen: "imagenes/im21.jpg" },
  { nombre: "Juguete", precio: 350, categoria: "niños" , imagen: "imagenes/im20.jpg"},
  { nombre: "Lámpara", precio: 900, categoria: "hogar", imagen: "imagenes/im21.jpg" },
     { nombre: "compu", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im22.jpg" },
    { nombre: "pocoritos", precio: 3, categoria: "dulces", imagen: "imagenes/im21.jpg"},
    { nombre: "vivo V50", precio: 5000, categoria: "tecnologia" , imagen: "imagenes/im19.jpg"},
    { nombre: "zapatos", precio: 1400, categoria: "calzado", imagen: "imagenes/im12.jpg" },
   { nombre: "mouse inalambrico", precio: 350, categoria: "tecnologia", imagen: "imagenes/im18.jpg" },
    { nombre: "monitor 27", precio: 4500, categoria: "tecnologia", imagen: "imagenes/im16.jpg" },
    { nombre: "teclado mecanico", precio: 800, categoria: "tecnologia", imagen: "imagenes/im17.jpg" },
    { nombre: "audifonos BT", precio: 600, categoria: "tecnologia", imagen: "imagenes/im11.jpg" },
    { nombre: "disco duro ext.", precio: 1200, categoria: "tecnologia", imagen: "imagenes/im7.jpg" },
   { nombre: "cuaderno prof.", precio: 65, categoria: "papeleria", imagen: "imagenes/im12.jpg" },
    { nombre: "pluma gel", precio: 20, categoria: "belleza", imagen: "imagenes/im4.jpg" },
    { nombre: "botella agua", precio: 150, categoria: "liquidos", imagen: "imagenes/im5.jpg" },
    { nombre: "pilas AA (4)", precio: 50, categoria: "tecnologia", imagen: "imagenes/im19.jpg" },
    { nombre: "cargador portatil", precio: 400, categoria: "tecnologia" , imagen: "imagenes/im3.jpg"}
];
actual = 0;

let tabla1 = "<table border='1' cellspacing='0' cellpadding='5'>";
tabla1 += "<tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Categoría</th></tr>";

for (p of productos) { 
  tabla1 += `
    <tr>
      <td><img src="${p.imagen}" width="80"></td>
      <td>${p.nombre}</td>
      <td>${p.precio}</td>
      <td>${p.categoria}</td>
    </tr>`;
    /*" <tr><td>${p.nombre}</td><td>${p.precio}</td><td>${p.categoria}</td></tr>`;"*/
}

tabla1 += "</table>";
document.getElementById("control1").innerHTML = tabla1;



function mostrarProductos(arreglo) {
  tabla2 = "";
  for (let p of arreglo) {
    
    tabla2 += `
      <div class="producto">
        <img src="${p.imagen}" alt="${p.nombre} " width="80">
        <h3>${p.nombre}</h3>
        <p>$${p.precio}</p>
        <p>${p.categoria}</p>
      </div>
    `;
  }
  document.getElementById("control2").innerHTML = tabla2;
}

mostrarProductos(productos);


