const productos = [
  { nombre: "compu", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im1.jpg" },
  { nombre: "Mouse", precio: 300, categoria: "tecnologia", imagen: "imagenes/im2.jpg" },
  { nombre: "Teclado", precio: 800, categoria: "tecnologia", imagen: "imagenes/im3.jpg" },
  { nombre: "Monitor", precio: 4500, categoria: "tecnologia", imagen: "imagenes/im14.jpg" },
  { nombre: "Auriculares", precio: 1200, categoria: "tecnologia", imagen: "imagenes/im5.jpg" },
  { nombre: "Router", precio: 2000, categoria: "tecnologia", imagen: "imagenes/im6.jpg" },
  { nombre: "telefono", precio: 8000, categoria: "tecnologia", imagen: "imagenes/im7.jpg" },
  { nombre: "SillaGamer", precio: 3500, categoria: "muebles", imagen: "imagenes/im8.jpg" },
  { nombre: "crema hidratante", precio: 400, categoria: "belleza", imagen: "imagenes/im32.jpg" },
  { nombre: "mascarilla facial", precio: 80, categoria: "belleza", imagen: "imagenes/im33.jpg" },
  { nombre: "shampoo natural", precio: 150, categoria: "belleza", imagen: "imagenes/im34.jpg" },
   { nombre: "caja herramientas", precio: 850, categoria: "hogar", imagen: "imagenes/im19.jpg" },
  { nombre: "martillo", precio: 200, categoria: "herramientas", imagen: "imagenes/im50.jpg" },
  { nombre: "destornillador", precio: 150, categoria: "herramientas", imagen: "imagenes/im49.jpg" },
  { nombre: "taladro", precio: 2500, categoria: "herramientas", imagen: "imagenes/im48.jpg" },
  { nombre: "llave inglesa", precio: 180, categoria: "herramientas", imagen: "imagenes/im47.jpg" },
  { nombre: "sierra electrica", precio: 3100, categoria: "herramientas", imagen: "imagenes/im6.jpg" },
  { nombre: "caja tornillos", precio: 90, categoria: "herramientas", imagen: "imagenes/im7.jpg" },
  { nombre: "cinta métrica", precio: 120, categoria: "herramientas", imagen: "imagenes/im8.jpg" },
  { nombre: "acondicionador", precio: 160, categoria: "belleza", imagen: "imagenes/im35.jpg" },
  { nombre: "gel cabello", precio: 100, categoria: "belleza", imagen: "imagenes/im36.jpg" },
  { nombre: "peine", precio: 60, categoria: "belleza", imagen: "imagenes/im37.jpg" },
  { nombre: "secadora", precio: 950, categoria: "belleza", imagen: "imagenes/im38.jpg" },
  { nombre: "plancha ropa", precio: 800, categoria: "hogar", imagen: "imagenes/im39.jpg" },
  { nombre: "colchón inflable", precio: 1900, categoria: "hogar", imagen: "imagenes/im40.jpg" },
  { nombre: "almohada", precio: 350, categoria: "hogar", imagen: "imagenes/im41.jpg" },
  { nombre: "tendedero", precio: 500, categoria: "hogar", imagen: "imagenes/im42.jpg" },
  { nombre: "organizador ropa", precio: 400, categoria: "hogar", imagen: "imagenes/im43.jpg" },
  { nombre: "maceta", precio: 250, categoria: "jardineria", imagen: "imagenes/im44.jpg" },
  { nombre: "tierra abonada", precio: 100, categoria: "jardineria", imagen: "imagenes/im45.jpg" },
  { nombre: "regadera", precio: 180, categoria: "jardineria", imagen: "imagenes/im46.jpg" },
  { nombre: "plantas suculentas", precio: 250, categoria: "jardineria", imagen: "imagenes/im47.jpg" },
  { nombre: "manguera", precio: 400, categoria: "jardineria", imagen: "imagenes/im48.jpg" },
  { nombre: "guantes jardin", precio: 150, categoria: "jardineria", imagen: "imagenes/im49.jpg" },
  { nombre: "pala chica", precio: 100, categoria: "jardineria", imagen: "imagenes/im50.jpg" },
  { nombre: "tenis", precio: 2000, categoria: "ropa", imagen: "imagenes/im7.jpg" },
  { nombre: "Escritorio", precio: 4000, categoria: "muebles", imagen: "imagenes/im50.jpg" },
  { nombre: "blusa", precio: 500, categoria: "ropa", imagen: "imagenes/im6.jpg" },
  { nombre: "Cafetera", precio: 1800, categoria: "cafe", imagen: "imagenes/im24.jpg" },
  { nombre: "CamisaGodin", precio: 100, categoria: "ropa", imagen: "imagenes/im34.jpg" },
  { nombre: "Pantalon", precio: 1200, categoria: "ropa", imagen: "imagenes/im9.jpg" },
  { nombre: "taza", precio: 300, categoria: "cafe", imagen: "imagenes/im8.jpg" },
  { nombre: "compu2", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im4.jpg" },
  { nombre: "mini panditas", precio: 10, categoria: "dulces", imagen: "imagenes/im15.jpg" },
  { nombre: "vivo V50", precio: 5000, categoria: "tecnologia", imagen: "imagenes/im10.jpg" },
  { nombre: "zapatos", precio: 1400, categoria: "calzado", imagen: "imagenes/im11.jpg" },
  { nombre: "laptop HP", precio: 18000, categoria: "tecnologia", imagen: "imagenes/im19.jpg" },
  { nombre: "mouse gamer", precio: 450, categoria: "tecnologia", imagen: "imagenes/im18.jpg" },
  { nombre: "teclado2", precio: 1200, categoria: "tecnologia", imagen: "imagenes/im10.jpg" },
  { nombre: "audifonos bluetooth", precio: 800, categoria: "tecnologia", imagen: "imagenes/im17.jpg" },
  { nombre: "monitor Samsung", precio: 3500, categoria: "tecnologia", imagen: "imagenes/im15.jpg" },
  { nombre: "taza2", precio: 120, categoria: "hogar", imagen: "imagenes/im45.jpg" },
  { nombre: "mochila", precio: 600, categoria: "accesorios", imagen: "imagenes/im14.jpg" },
  { nombre: "libreta", precio: 80, categoria: "papeleria", imagen: "imagenes/im15.jpg" },
  { nombre: "pelota", precio: 250, categoria: "deportes", imagen: "imagenes/im18.jpg" },
  { nombre: "reloj", precio: 900, categoria: "moda", imagen: "imagenes/im19.jpg" },
  { nombre: "Compu", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im20.jpg" },
  { nombre: "Pecocitas", precio: 3, categoria: "dulces", imagen: "imagenes/im21.jpg" },
  { nombre: "Vivo V50", precio: 5000, categoria: "tecnologia", imagen: "imagenes/im22.jpg" },
  { nombre: "Zapatos2", precio: 1400, categoria: "calzado", imagen: "imagenes/im24.jpg" },
  { nombre: "Tablet", precio: 8000, categoria: "tecnologia", imagen: "imagenes/im23.jpg" },
  { nombre: "Smartphone", precio: 6000, categoria: "tecnologia", imagen: "imagenes/im25.jpg" },
  { nombre: "Monitor2", precio: 7000, categoria: "tecnologia", imagen: "imagenes/im21.jpg" },
  { nombre: "Auriculares2", precio: 1200, categoria: "tecnologia", imagen: "imagenes/im23.jpg" },
  { nombre: "Disco Duro", precio: 2500, categoria: "tecnologia", imagen: "imagenes/im21.jpg" },
  { nombre: "Libro", precio: 200, categoria: "papeleria", imagen: "imagenes/im24.jpg" },
  { nombre: "Camisa", precio: 600, categoria: "ropa", imagen: "imagenes/im25.jpg" },
  { nombre: "Mueble", precio: 4500, categoria: "hogar", imagen: "imagenes/im21.jpg" },
  { nombre: "Juguete", precio: 350, categoria: "niños", imagen: "imagenes/im20.jpg" },
  { nombre: "Lámpara", precio: 900, categoria: "hogar", imagen: "imagenes/im21.jpg" },
  { nombre: "compu3", precio: 15000, categoria: "tecnologia", imagen: "imagenes/im22.jpg" },
  { nombre: "pocoritos", precio: 3, categoria: "dulces", imagen: "imagenes/im21.jpg" },
  { nombre: "vivo V50 2", precio: 5000, categoria: "tecnologia", imagen: "imagenes/im19.jpg" },
  { nombre: "zapatos3", precio: 1400, categoria: "calzado", imagen: "imagenes/im12.jpg" },
  { nombre: "mouse inalambrico", precio: 350, categoria: "tecnologia", imagen: "imagenes/im18.jpg" },
  { nombre: "monitor 27", precio: 4500, categoria: "tecnologia", imagen: "imagenes/im16.jpg" },
  { nombre: "teclado mecanico", precio: 800, categoria: "tecnologia", imagen: "imagenes/im17.jpg" },
  { nombre: "audifonos BT", precio: 600, categoria: "tecnologia", imagen: "imagenes/im11.jpg" },
  { nombre: "disco duro ext.", precio: 1200, categoria: "tecnologia", imagen: "imagenes/im7.jpg" },
  { nombre: "cuaderno prof.", precio: 65, categoria: "papeleria", imagen: "imagenes/im12.jpg" },
  { nombre: "pluma gel", precio: 20, categoria: "belleza", imagen: "imagenes/im4.jpg" },
  { nombre: "botella agua", precio: 150, categoria: "liquidos", imagen: "imagenes/im5.jpg" },
    { nombre: "sillon infantil", precio: 850, categoria: "niños", imagen: "imagenes/im8.jpg" },
  { nombre: "juguete educativo", precio: 300, categoria: "niños", imagen: "imagenes/im9.jpg" },
  { nombre: "puzzle madera", precio: 200, categoria: "niños", imagen: "imagenes/im10.jpg" },
  { nombre: "carro juguete", precio: 350, categoria: "niños", imagen: "imagenes/im11.jpg" },
  { nombre: "muñeca", precio: 400, categoria: "niños", imagen: "imagenes/im12.jpg" },
  { nombre: "lego city", precio: 1500, categoria: "niños", imagen: "imagenes/im13.jpg" },
  { nombre: "patineta", precio: 1200, categoria: "deportes", imagen: "imagenes/im14.jpg" },
  { nombre: "balon futbol", precio: 350, categoria: "deportes", imagen: "imagenes/im15.jpg" },
  { nombre: "balon basquet", precio: 400, categoria: "deportes", imagen: "imagenes/im16.jpg" },
  { nombre: "raqueta tenis", precio: 1100, categoria: "deportes", imagen: "imagenes/im17.jpg" },
  { nombre: "guantes box", precio: 800, categoria: "deportes", imagen: "imagenes/im18.jpg" },
  { nombre: "bicicleta", precio: 5500, categoria: "deportes", imagen: "imagenes/im19.jpg" },
  { nombre: "patines", precio: 1400, categoria: "deportes", imagen: "imagenes/im20.jpg" },
  { nombre: "set pintura", precio: 500, categoria: "papeleria", imagen: "imagenes/im21.jpg" },
  { nombre: "hojas blancas", precio: 120, categoria: "papeleria", imagen: "imagenes/im22.jpg" },
  { nombre: "plumones", precio: 180, categoria: "papeleria", imagen: "imagenes/im23.jpg" },
  { nombre: "marcadores", precio: 200, categoria: "papeleria", imagen: "imagenes/im24.jpg" },
  { nombre: "carpeta a4", precio: 90, categoria: "papeleria", imagen: "imagenes/im25.jpg" },
  { nombre: "set lapices", precio: 150, categoria: "papeleria", imagen: "imagenes/im26.jpg" },
  { nombre: "goma borrar", precio: 30, categoria: "papeleria", imagen: "imagenes/im27.jpg" },
  { nombre: "regla 30cm", precio: 25, categoria: "papeleria", imagen: "imagenes/im28.jpg" },
  { nombre: "cuaderno cuadriculado", precio: 60, categoria: "papeleria", imagen: "imagenes/im29.jpg" },
  { nombre: "agenda 2025", precio: 200, categoria: "papeleria", imagen: "imagenes/im30.jpg" },
  { nombre: "cepillo facial", precio: 500, categoria: "belleza", imagen: "imagenes/im31.jpg" },
  { nombre: "pilas AA (4)", precio: 50, categoria: "tecnologia", imagen: "imagenes/im19.jpg" },
  { nombre: "cargador portatil", precio: 400, categoria: "tecnologia", imagen: "imagenes/im3.jpg" },
   { nombre: "impresora", precio: 2500, categoria: "tecnologia", imagen: "imagenes/im26.jpg" },
  { nombre: "bocina bluetooth", precio: 700, categoria: "tecnologia", imagen: "imagenes/im27.jpg" },
  { nombre: "cafetera premium", precio: 3500, categoria: "cafe", imagen: "imagenes/im28.jpg" },
  { nombre: "chaqueta", precio: 1200, categoria: "ropa", imagen: "imagenes/im29.jpg" },
  { nombre: "tenis deportivos", precio: 2200, categoria: "calzado", imagen: "imagenes/im30.jpg" },
  { nombre: "reloj inteligente", precio: 2800, categoria: "tecnologia", imagen: "imagenes/im31.jpg" },
  { nombre: "lampara escritorio", precio: 400, categoria: "hogar", imagen: "imagenes/im32.jpg" },
  { nombre: "ventilador", precio: 900, categoria: "hogar", imagen: "imagenes/im33.jpg" },
  { nombre: "sillon reclinable", precio: 6500, categoria: "muebles", imagen: "imagenes/im34.jpg" },
  { nombre: "cartera piel", precio: 750, categoria: "moda", imagen: "imagenes/im35.jpg" },
  { nombre: "bolsa de mano", precio: 1200, categoria: "moda", imagen: "imagenes/im36.jpg" },
  { nombre: "collar acero", precio: 400, categoria: "moda", imagen: "imagenes/im37.jpg" },
  { nombre: "calcetines deportivos", precio: 150, categoria: "ropa", imagen: "imagenes/im38.jpg" },
  { nombre: "audifonos gamer", precio: 950, categoria: "tecnologia", imagen: "imagenes/im39.jpg" },
  { nombre: "camara web", precio: 650, categoria: "tecnologia", imagen: "imagenes/im40.jpg" },
  { nombre: "aspiradora", precio: 2000, categoria: "hogar", imagen: "imagenes/im41.jpg" },
  { nombre: "microondas", precio: 3200, categoria: "hogar", imagen: "imagenes/im42.jpg" },
  { nombre: "licuadora", precio: 1800, categoria: "hogar", imagen: "imagenes/im43.jpg" },
  { nombre: "sarten antiadherente", precio: 500, categoria: "hogar", imagen: "imagenes/im44.jpg" },
  { nombre: "set de cuchillos", precio: 900, categoria: "hogar", imagen: "imagenes/im45.jpg" },
  { nombre: "reloj deportivo", precio: 1200, categoria: "moda", imagen: "imagenes/im46.jpg" },
  { nombre: "cable HDMI", precio: 100, categoria: "tecnologia", imagen: "imagenes/im3.jpg" },
  { nombre: "soporte laptop", precio: 350, categoria: "tecnologia", imagen: "imagenes/im15.jpg" },
  { nombre: "alfombra", precio: 800, categoria: "hogar", imagen: "imagenes/im31.jpg" },
  { nombre: "cojin decorativo", precio: 250, categoria: "hogar", imagen: "imagenes/im33.jpg" },
  { nombre: "reproductor mp3", precio: 600, categoria: "tecnologia", imagen: "imagenes/im37.jpg" },
  { nombre: "gafas de sol", precio: 700, categoria: "moda", imagen: "imagenes/im17.jpg" },
  { nombre: "chaqueta cuero", precio: 2000, categora: "ropa", imagen: "imagenes/im14.jpg" },
  { nombre: "billetera", precio: 400, categoria: "moda", imagen: "imagenes/im19.jpg" },
  { nombre: "parlante portátil", precio: 850, categoria: "tecnologia", imagen: "imagenes/im23.jpg" },
  { nombre: "mesa centro", precio: 3200, categoria: "muebles", imagen: "imagenes/im6.jpg" },
  { nombre: "toalla baño", precio: 300, categoria: "hogar", imagen: "imagenes/im35.jpg" },
  { nombre: "camisa deportiva", precio: 500, categoria: "ropa", imagen: "imagenes/im38.jpg" },
  { nombre: "pantalon mezclilla", precio: 900, categoria: "ropa", imagen: "imagenes/im39.jpg" },
  { nombre: "juego sabanas", precio: 1400, categoria: "hogar", imagen: "imagenes/im42.jpg" },
  { nombre: "batidora", precio: 1100, categoria: "hogar", imagen: "imagenes/im3.jpg" },
  { nombre: "set maquillaje", precio: 600, categoria: "belleza", imagen: "imagenes/im15.jpg" },
  { nombre: "plancha cabello", precio: 950, categoria: "belleza", imagen: "imagenes/im31.jpg" },
  { nombre: "cepillo electrico", precio: 400, categoria: "belleza", imagen: "imagenes/im33.jpg" },
    { nombre: "aspiradora mini", precio: 800, categoria: "hogar", imagen: "imagenes/im43.jpg" },
  { nombre: "foco led", precio: 90, categoria: "hogar", imagen: "imagenes/im44.jpg" },
  { nombre: "cargador rapido", precio: 400, categoria: "tecnologia", imagen: "imagenes/im45.jpg" },
  { nombre: "usb 64gb", precio: 300, categoria: "tecnologia", imagen: "imagenes/im46.jpg" },
  { nombre: "powerbank 10000mAh", precio: 600, categoria: "tecnologia", imagen: "imagenes/im47.jpg" },
  { nombre: "smartwatch pro", precio: 3500, categoria: "tecnologia", imagen: "imagenes/im48.jpg" },
  { nombre: "camara deportiva", precio: 2500, categoria: "tecnologia", imagen: "imagenes/im49.jpg" },
  { nombre: "teclado gamer", precio: 1300, categoria: "tecnologia", imagen: "imagenes/im50.jpg" },
  { nombre: "drone", precio: 5000, categoria: "tecnologia", imagen: "imagenes/im1.jpg" },
  { nombre: "mini proyector", precio: 3200, categoria: "tecnologia", imagen: "imagenes/im2.jpg" },
  { nombre: "control consola", precio: 900, categoria: "tecnologia", imagen: "imagenes/im3.jpg" },
  { nombre: "silla plegable", precio: 700, categoria: "muebles", imagen: "imagenes/im4.jpg" },
  { nombre: "mesa plegable", precio: 1500, categoria: "muebles", imagen: "imagenes/im5.jpg" },
  { nombre: "repisa", precio: 1000, categoria: "muebles", imagen: "imagenes/im6.jpg" },
  { nombre: "cajonera", precio: 1300, categoria: "muebles", imagen: "imagenes/im7.jpg" },
  { nombre: "perfume hombre", precio: 1200, categoria: "belleza", imagen: "imagenes/im37.jpg" },
  { nombre: "perfume mujer", precio: 1300, categoria: "belleza", imagen: "imagenes/im6.jpg" },
  { nombre: "silla oficina", precio: 2800, categoria: "muebles", imagen: "imagenes/im8.jpg" },
  { nombre: "mouse pad", precio: 120, categoria: "tecnologia", imagen: "imagenes/im10.jpg" },
  { nombre: "soporte celular", precio: 180, categoria: "tecnologia", imagen: "imagenes/im18.jpg" },
  { nombre: "humidificador", precio: 850, categoria: "hogar", imagen: "imagenes/im29.jpg" },
  { nombre: "luz led", precio: 200, categoria: "hogar", imagen: "imagenes/im41.jpg" },
  { nombre: "sandalias", precio: 400, categoria: "calzado", imagen: "imagenes/im43.jpg" },
  { nombre: "gorra", precio: 250, categoria: "moda", imagen: "imagenes/im21.jpg" },
  { nombre: "mochila escolar", precio: 650, categoria: "accesorios", imagen: "imagenes/im20.jpg" },
  { nombre: "calculadora", precio: 300, categoria: "papeleria", imagen: "imagenes/im12.jpg" },
  { nombre: "tostadora", precio: 900, categoria: "hogar", imagen: "imagenes/im45.jpg" },
    { nombre: "linterna", precio: 300, categoria: "hogar", imagen: "imagenes/im10.jpg" },
  { nombre: "bocina chica", precio: 400, categoria: "tecnologia", imagen: "imagenes/im11.jpg" },
  { nombre: "camisa lino", precio: 700, categoria: "ropa", imagen: "imagenes/im12.jpg" },
  { nombre: "chaqueta invierno", precio: 1600, categoria: "ropa", imagen: "imagenes/im13.jpg" },
  { nombre: "short deportivo", precio: 350, categoria: "ropa", imagen: "imagenes/im14.jpg" },
  { nombre: "sudadera", precio: 800, categoria: "ropa", imagen: "imagenes/im15.jpg" },
  { nombre: "tenis casuales", precio: 1900, categoria: "calzado", imagen: "imagenes/im16.jpg" },
  { nombre: "botas montaña", precio: 2400, categoria: "calzado", imagen: "imagenes/im17.jpg" },
  { nombre: "sandalias playa", precio: 450, categoria: "calzado", imagen: "imagenes/im18.jpg" },
  { nombre: "zapatos formales", precio: 1700, categoria: "calzado", imagen: "imagenes/im19.jpg" },
  { nombre: "bufanda", precio: 200, categoria: "moda", imagen: "imagenes/im20.jpg" },
  { nombre: "sombrero", precio: 300, categoria: "moda", imagen: "imagenes/im21.jpg" },
  { nombre: "pulsera cuero", precio: 250, categoria: "moda", imagen: "imagenes/im22.jpg" },
  { nombre: "collar plata", precio: 700, categoria: "moda", imagen: "imagenes/im23.jpg" },
  { nombre: "reloj elegante", precio: 2200, categoria: "moda", imagen: "imagenes/im24.jpg" },
  { nombre: "mochila laptop", precio: 850, categoria: "accesorios", imagen: "imagenes/im25.jpg" },
  { nombre: "portafolio", precio: 950, categoria: "accesorios", imagen: "imagenes/im26.jpg" },
  { nombre: "bolso deportivo", precio: 700, categoria: "accesorios", imagen: "imagenes/im27.jpg" },
  { nombre: "maleta viaje", precio: 2100, categoria: "accesorios", imagen: "imagenes/im28.jpg" },
  { nombre: "cinturon cuero", precio: 400, categoria: "moda", imagen: "imagenes/im29.jpg" },
  { nombre: "taza termica", precio: 250, categoria: "cafe", imagen: "imagenes/im30.jpg" },
  { nombre: "cafetera mini", precio: 1200, categoria: "cafe", imagen: "imagenes/im31.jpg" },
  { nombre: "capsulas cafe", precio: 350, categoria: "cafe", imagen: "imagenes/im32.jpg" },
  { nombre: "set tazas", precio: 600, categoria: "hogar", imagen: "imagenes/im33.jpg" },
  { nombre: "cojin ergonomico", precio: 550, categoria: "hogar", imagen: "imagenes/im34.jpg" },
  { nombre: "manta polar", precio: 900, categoria: "hogar", imagen: "imagenes/im35.jpg" },
  { nombre: "cortina baño", precio: 450, categoria: "hogar", imagen: "imagenes/im36.jpg" },
  { nombre: "tapete cocina", precio: 300, categoria: "hogar", imagen: "imagenes/im37.jpg" },
  { nombre: "reloj pared", precio: 700, categoria: "hogar", imagen: "imagenes/im38.jpg" },
  { nombre: "set cubiertos", precio: 400, categoria: "hogar", imagen: "imagenes/im39.jpg" },
  { nombre: "vasos vidrio", precio: 300, categoria: "hogar", imagen: "imagenes/im40.jpg" },
  { nombre: "escoba", precio: 150, categoria: "hogar", imagen: "imagenes/im41.jpg" },
  { nombre: "recogedor", precio: 120, categoria: "hogar", imagen: "imagenes/im42.jpg" }
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


////////////////////////////////


document.getElementById("eje1").addEventListener("click", () => {
  const filtrados = productos.filter(p => p.categoria === "tecnologia");
  mostrarProductos(filtrados);
});
document.getElementById("eje2").addEventListener("click", () => {
  const filtrados = productos.filter(p => p.categoria === "dulces");
  mostrarProductos(filtrados);
});
document.getElementById("eje3").addEventListener("click", () => {
  const filtrados = productos.filter(p => p.precio <= 500);
  mostrarProductos(filtrados);
});
document.getElementById("eje4").addEventListener("click", () => {
  const filtrados = productos
    .filter(p => p.precio <= 500)
    .sort((a, b) => a.precio - b.precio); 
  mostrarProductos(filtrados);
});
document.getElementById("eje5").addEventListener("click", () => {
  const filtrados = productos
    .filter(p => p.precio >= 501 && p.precio <= 2000)
    .sort((a, b) => a.precio - b.precio); 
  mostrarProductos(filtrados);
});
document.getElementById("eje6").addEventListener("click", () => {
  actual++;
  if (actual > 25) 
    actual = 1; 
    
  const filtrados = productos
    .filter(p => p.imagen === "imagenes/im" + actual + ".jpg")
  mostrarProductos(filtrados);
});
document.getElementById("eje7").addEventListener("click", () => {

  mostrarProductos(productos);
});