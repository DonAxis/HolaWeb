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

  const canvas = document.createElement('canvas');
canvas.width=300;
canvas.height=300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

ctx.lineWidth = 8; // ancho linea

ctx.strokeRect(75, 140, 150, 110); //rectangulo

ctx.fillRect(130, 190, 40, 60); //rectangulo con relleno

ctx.beginPath(); //poligono
ctx.moveTo(50, 140);
ctx.lineTo(150, 60);
ctx.lineTo(250, 140);
ctx.closePath();
ctx.stroke();
