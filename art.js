function  casita(){


  const canvas = document.createElement('canvas');
  canvas.width=400;
  canvas.height=300;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  ctx.lineWidth = 8; // ancho linea

  ctx.fillStyle='yellow';
  ctx.fillRect(230, 160, 50, 50); //rectangulo luz

  ctx.strokeRect(230, 160, 50, 50); //rectangulo ventana
  ctx.strokeRect(230, 160, 25, 25); //rectangulo ventana marco
  ctx.strokeRect(230, 185, 25, 25); //rectangulo ventana marco
  ctx.strokeRect(255, 160, 25, 25); //rectangulo ventana marco
  ctx.fillStyle='brown';
  ctx.strokeRect(130, 190, 40, 60); //rectangulo puerta
  ctx.fillRect(130, 190, 40, 60); //rectangulo puerta
  ctx.strokeRect(75, 140, 250, 110); //rectangulo casa

  ctx.beginPath(); //poligono techo
  ctx.moveTo(50, 140);
  ctx.lineTo(200, 60);
  ctx.lineTo(350, 140);
  ctx.closePath();
  ctx.stroke();  //fin poligono

  ctx.fillStyle='red';

  ctx.font = "30px serif"; //texto
  ctx.fillText("Casita", 90, 170)
}


/*const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [1080, 1080],
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'blue';
    context.fillRect(0, 0, width, height);
  };
};

canvasSketch(sketch, settings);
*/













