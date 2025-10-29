arr1 = ["uno", "dos", "tres","cuatro","cinco"];
arr2 = ["sicuenta", "noventa", "ochenta"];
const numeros = [1, 2, 3, 4, 5]; //numeros
const edades = [15, 22, 18, 30, 12, 25, 55, 80];

console.warn("arreglos originales: ", arr1, "  y ", arr2);

sumacon = [];
sumacon = sumacon.concat(arr1, arr2);
console.warn(" 'concat' concatenado:", sumacon);

arr1.push("cien");
console.warn("push de arrelgo +'cien' ", arr1);

const dobles = numeros.map(x => x * 2); //=> es una función con return
console.warn("Original:", numeros, " map() x2:", dobles);


const mayusculas = arr2.map(arr2 => arr2.toUpperCase());
console.error("map hace cambios aqui Mayúsculas:", mayusculas);

const mayores = edades.filter(edad => edad >= 18);//=> es una función con return
console.warn("filter filtra usa la funcion flecha: ", edades , " filter() mayores de 18:", mayores);

const filtrada = arr1.filter(Y => Y.startsWith("u"));
console.error("tambien filtra texto", arr1, " empieza con 'u':", filtrada);

const total = edades.reduce((sumar, todo) => sumar + todo, 0);
console.warn("reduce, permite hacer operaciones ", edades, " reduce() suma total:", total);

const palabra = arr1.reduce((acum, palabra) => acum + palabra, "");
console.error("reduce de sumas con string ",arr1,"crea ", palabra);

const usuarios = [	//esto es un array de objetos id nombre edad
    { id: 1, nombre: "Ana", edad: 25 },
    { id: 2, nombre: "Luis", edad: 30 },
    { id: 3, nombre: "María", edad: 28 }
];
const usuariobuscado = usuarios.find(user => user.id === 2);
console.log("arreglo de objetos",usuarios);
console.warn("find busca algo del arreglo, id 2 me da: ", usuariobuscado);

const numeroBuscado = edades.find(n => n > 18);
console.error("aqui busca numeros el primero >18:",edades," me da: ", numeroBuscado);


// si ponemos edades.sort, ordenara en edades
//si ponemos ...edades.sort, no modificara la variable edades 
const ordenadosAsc = [...edades].sort((a, b) => a - b);	
const ordenadosDesc = [...edades].sort((a, b) => b - a);
console.warn("sort, para ordenar", edades, "mayor",ordenadosAsc,"menor",ordenadosDesc);
const nombresOrdenados = [...arr1].sort();
console.error("funciona con texto: ",arr1," :", nombresOrdenados);

console.warn("includes, busca y arroja true o false ",arr1," tiene 'unos'", arr1.includes("unos"));
console.error("con numero igual",edades," tiene '30'? ", edades.includes(30));

console.warn("INDEXOF busca la posicion: busca 'dos'", arr1.indexOf("dos")); 
console.error("-1 su el dato no existe: busca 'nueve'", arr1.indexOf("nueve"));

 mal = edades.some(X => X == 6);
 bien = numeros.some(Y => Y < 6);
console.warn("SOME, devuelve true o false IF alguno se cumple 'or': 'edades[]'==6 ", mal,", numeros[]<6 ", bien);

 mal = edades.every(X => X <= 30);
 bien = numeros.every(Y => Y < 18);
console.warn("EVERY devuelve FoV si TODOS cumplen 'and': edad <= 30",mal,", numeros<18 ", bien);

const listas = arr1.slice(1,4); // toma 1,2,3 hasta 4 (no toma el 4)
const ultimos = arr1.slice(-3); // últimos 3 elementos
console.warn("SLICE, toma dato de arreglo 1a3: ", listas,"-3 toma los ultimos 3: ", ultimos);
console.error("SLICE no modifica el original: ", arr1);

const dias = ["Lun", "Mar", "Mie", "Jue", "Vie"];
console.warn("SPLICE, si modificara el original aun siendo :",dias);
const elimi = dias.splice(1, 2);
console.error("SPLICE, inicia 1'mar'y avanza, moviendo2 en otra var: ", elimi,"'dias' despues de mover:", dias);
dias.splice(1, 0, "Mary", "Miente");
console.error("comienza en 1'jue' 0=sin avanzar borrando, agrega 'mary' y 'miente': ", dias);
dias.splice(2, 1, "MIERD","jujui");
console.error("coloca en 2'Mie' 1=borra1 y depués agrega MIERD y jujui:", dias);
console.log("dato: 'dias' es constante pero splice puede modificarlo");

comitas = arr1.join(", ");
listes = "# "+arr1.join("\n# ");
console.warn("JOIN, transforma el array a String, si pongo ',' :",comitas," y con '/n' + '#' :\n", listes);
console.error("agregue # manualmente a 'uno' con un +");

const ruta = ["home", "usuario", "documentos"];
const union = ruta.join("/");
console.error("un ejemplo mas una ruta:", union,"aunque el array es:", ruta);

const frase = "mi vieja mula";
const csv = "nombre,edad,ciudad";
const email = "usuario@dominio.com";
const arr3 = frase.split(" ");
console.warn("SPLIT, convierte el String a Array la frace: '",frase,"' ,asi queda usando el espacio", arr3);

//\n
const columnas = csv.split(",");
const partes = email.split("@");
console.error("podemos usar ',' '@' u otro separador, tengo: ",csv,"y",email,"\n asi queda:", columnas, " y ", partes);
