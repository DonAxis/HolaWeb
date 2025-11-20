// Obtiene el formulario por su ID
const formulario = document.getElementById('datosFormulario');

formulario.addEventListener('submit', function(event) {
    // Evita que el formulario se envíe de la forma tradicional (recarga la página)
    event.preventDefault();

    // Obtiene los valores de los campos
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;

    // Crea el contenido del archivo de texto
    // Puedes cambiar el formato aquí si lo deseas
    const contenidoTXT = `Nombre: ${nombre}\nTeléfono: ${telefono}\n---`;

    // 1. Crea un objeto Blob (Binary Large Object) con el contenido y el tipo MIME de texto plano
    const blob = new Blob([contenidoTXT], { type: 'text/plain' });

    // 2. Crea una URL para el Blob
    const url = URL.createObjectURL(blob);

    // 3. Crea un elemento <a> temporal para simular un clic de descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_contacto.txt'; // Nombre del archivo que se descargará
    
    // 4. Agrega el elemento al DOM, simula el clic y lo remueve
    document.body.appendChild(a);
    a.click();
    
    // 5. Limpia la URL del objeto Blob
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Opcional: Limpiar el formulario después de la descarga
    formulario.reset();
    alert('Datos guardados y archivo "datos_contacto.txt" descargado.');
});