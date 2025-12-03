  const canvasSketch = window.canvasSketch;

    const settings = { dimensions: [400, 300], animate: true };

    const sketch = ({ context, width, height }) => {
      let focused = null;    // 'name', 'pass', 'button', 'clicked', null
      let clicked = false;

      const inputName = document.getElementById('nombre');
      const inputPass = document.getElementById('pass');
      const btn = document.getElementById('btn');

      inputName.addEventListener('focus', () => {
        focused = 'name';
        clicked = false;
      });
      inputName.addEventListener('blur', () => {
        if (focused === 'name') focused = null;
      });

      inputPass.addEventListener('focus', () => {
        focused = 'pass';
        clicked = false;
      });
      inputPass.addEventListener('blur', () => {
        if (focused === 'pass') focused = null;
      });

      btn.addEventListener('mouseenter', () => {
        focused = 'button';
        clicked = false;
      });
      btn.addEventListener('mouseleave', () => {
        if (focused === 'button') focused = null;
      });
      btn.addEventListener('click', () => {
        clicked = true;
        focused = 'button';
        alert('iniciando logggggin');
      });

      return ({ context, width, height }) => {
        // zona a trabajar
        context.fillStyle = '#BAB4AF';
        context.fillRect(0, 0, width, height);

        // actualiza color segun donde este
        let color = 'blue';
        if (clicked && focused === 'button') {
          color = 'green';
        } else if (focused === 'button') {
          color = 'green';
        } else if (focused === 'pass') {
          color = 'black';
        } else if (focused === 'name') {
          color = 'yellow';
        }

        // el cuadrado
        context.fillStyle = color;
        context.fillRect(125, 20, 150, 150);
      };
    };

    canvasSketch(sketch, settings);