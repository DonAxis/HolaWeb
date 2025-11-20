let activa=false;

var elDom = document.getElementById("camiaText");

elDom.textContent ="Si das click en la imagen, descarga txt. En otro lado, el texto cambia";
function Colorea(){
    this.classList.toggle("cambia");
    console.log("ajam");
    if (activa){
        elDom.textContent ="guardaste un documento";
    }else{
        elDom.textContent ="Actualiza la pagina y vuelve a dar click";
    }
}
document.querySelector("body").addEventListener("click", Colorea);


function guardar(){
    console.log("guardando");
    activa=true;

    const docCuerpo = "este es un script que vamos a usar \n mclovin de 36 años";
    const tempo = new Blob([docCuerpo], { type: "text/plain" });//archivo temporal
    const enlace = document.createElement("a"); //crea un enlace 
    enlace.href = URL.createObjectURL(tempo);   //url de elace con archivo tempo
    enlace.download = "aALex.txt"; // nombre del archivo
    enlace.click();
}
document.querySelector(".documentoo").addEventListener("click", guardar);
