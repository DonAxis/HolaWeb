let activa=false;

var elDom = document.querySelector("h1");
elDom.textContent ="ahora ya cambia";
function Colorea(){
    this.classList.toggle("cambia");
    console.log("ajam");
    if (activa){
        elDom.textContent ="guardaste un documento";
    }else{
        elDom.textContent ="uwu";
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
