const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  let time = 0;

  function drawWave(color, amplitude, frequency, speed, offsetY) {
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
      const y =
        Math.sin(x * frequency + time * speed) * amplitude +
        offsetY;

      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // soft red wave
    drawWave("rgba(225, 6, 0, 0.25)", 20, 0.01, 1.5, canvas.height * 0.5);

    // white wave overlay
    drawWave("rgba(255, 255, 255, 0.4)", 15, 0.012, 1.2, canvas.height * 0.52);

    // subtle second red layer
    drawWave("rgba(179, 0, 0, 0.15)", 25, 0.008, 1.0, canvas.height * 0.48);

    time += 0.02;
  }

  animate();