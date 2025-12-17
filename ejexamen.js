/* Array con métodos de JS */
const metodosArray = [
    { titulo: "map()", descripcion: "Crea un nuevo array aplicando una función a cada elemento del array original.", codigo: "array.map(elemento => elemento * 2)" },
    { titulo: "filter()", descripcion: "Crea un nuevo array con los elementos que cumplan una condición específica.", codigo: "array.filter(elemento => elemento > 10)" },
    { titulo: "reduce()", descripcion: "Reduce el array a un único valor acumulando los resultados de aplicar una función.", codigo: "array.reduce((acum, elem) => acum + elem, 0)" },
    { titulo: "find()", descripcion: "Encuentra y retorna el primer elemento que cumpla con una condición.", codigo: "array.find(elemento => elemento.id === 5)" },
    { titulo: "sort()", descripcion: "Ordena los elementos del array (modifica el array original).", codigo: "array.sort((a, b) => a - b)" },
    { titulo: "includes()", descripcion: "Verifica si un array contiene un elemento específico.", codigo: "array.includes(5)" },
    { titulo: "indexOf()", descripcion: "Retorna el índice de la primera ocurrencia de un elemento.", codigo: "array.indexOf('valor')" },
    { titulo: "some()", descripcion: "Verifica si al menos un elemento cumple con una condición.", codigo: "array.some(elemento => elemento > 100)" },
    { titulo: "every()", descripcion: "Verifica si todos los elementos cumplen con una condición.", codigo: "array.every(elemento => elemento > 0)" },
    { titulo: "slice()", descripcion: "Extrae una porción del array sin modificar el original.", codigo: "array.slice(inicio, fin)" },
    { titulo: "splice()", descripcion: "Añade, elimina o reemplaza elementos (modifica el array original).", codigo: "array.splice(inicio, cantidad, ...nuevos)" },
    { titulo: "join()", descripcion: "Une todos los elementos del array en un string.", codigo: "array.join(', ')" },
    { titulo: "split()", descripcion: "Divide un string en un array usando un separador.", codigo: "string.split(',')" },
];

const contenedorMetodos = document.getElementById('metodos');
const btnMetodos = document.getElementById('btnMetodos');

/* Crear los bloques dinámicamente */
metodosArray.forEach(metodo => {
    const bloqueDiv = document.createElement('div');
    bloqueDiv.classList.add('bloque');

    bloqueDiv.innerHTML = `
        <h3>${metodo.titulo}</h3>
        <p>${metodo.descripcion}</p>
        <p class="codigo">${metodo.codigo}</p>
    `;

    contenedorMetodos.appendChild(bloqueDiv);
});

/* Mostrar/ocultar métodos con botón */
btnMetodos.addEventListener('click', () => {
    contenedorMetodos.classList.toggle('oculto'); // alterna la visibilidad

    if (contenedorMetodos.classList.contains('oculto')) {
        btnMetodos.textContent = 'Mostrar métodos';
    } else {
        btnMetodos.textContent = 'Ocultar métodos';
    }
});
