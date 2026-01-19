/*
npm install canvas-sketch-cli -g
canvas-sketch art.js --open
canvas-sketch art.js --new --open
*/
// info https://github.com/mattdesl/canvas-sketch

//uso canvas
//const canvasSketch = require('canvas-sketch'); //importamos para pc
const canvasSketch = window.canvasSketch; // este es para la github

///
const settings = {
  dimensions: [1080, 1080], //tamaño de canvas
  animate: true, //se llama la funcion renderizado (abajo) 60 veces por segundo
};

const sketch = ({ context, width, height }) => {
  let XX=0,YY=0;
  context.fillStyle = '#B2E4EB';
  context.fillRect(0, 0, width, height);  //fill relleno
  //si pones esots solo limpi 1 vez
  return ({ context, width, height }) => {// funcion renderizado
  //  context.fillStyle = '#B2E4EB';
  //  context.fillRect(0, 0, width, height);  //fill relleno
//no limplia

    ///////////////
    context.fillStyle = '#52342E';
    // Set line width
      context.lineWidth = 10;

      // Wall
      context.strokeRect(XX+75, YY+140, 150, 110);

      // Door
      context.fillRect(XX+130, YY+190, 40, 60);
      XX+=5;
      // Roof
      context.beginPath();
      context.moveTo(XX+50, YY+140);
      context.lineTo(XX+150, YY+60);
      context.lineTo(XX+250, YY+140);
      context.closePath();
      context.stroke();

if (XX>=800){
  XX=0;
  YY+=100;
}

  };
};

canvasSketch(sketch, settings);

