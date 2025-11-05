const productos = [
    { nombre: "compu", precio: 15000, categoria: "tecnologia" },
    { nombre: "Mouse", precio: 300, categoria: "tecnologia" },
    { nombre: "SillaGamer", precio: 2500, categoria: "muebles" },
    { nombre: "Teclado", precio: 800, categoria: "tecnologia" },
    { nombre: "posterPared", precio: 5000, categoria: "muebles" }
];


/* filtraremos primero por "tecnologia" (filter),
 ordenaremos por precio de menor a mayor (sort),
 tomamos nombres (map),
 y 
 unimos nombres en un solo string separado por '>' (join) */

 //const resultado = productos.filter(p => p.categoria === "tecnologia").sort((a, b) => a.precio - b.precio).map(p => p.nombre).join(" o ");
//puedes escribirlo en varios renglones
 const resultado = productos
    .filter(p => p.categoria === "tecnologia")
    .sort((a, b) => a.precio - b.precio)
    .map(p => p.nombre)
	.join(" > ");
console.warn("Productos de tecnología ordenados por precio:", resultado);

// sumaremos el precio de tecnoloia
/* 
volvemos a filtrar "tecnologia" (filter),
 y luego sumamos (reduce) */

const aPagar = productos
    .filter(X => X.categoria === "tecnologia")
    .reduce((total, X) => total + X.precio, 0);

console.warn("Total de productos de tecnología: $" + aPagar);