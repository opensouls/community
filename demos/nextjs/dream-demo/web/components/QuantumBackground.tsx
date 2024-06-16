import { useEffect, useRef } from 'react';

const QuantumBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const info = infoRef.current!;

    let width: number, height: number;
    let shapes: Shape[] = [];
    let currentBaseColorIndex = 0;

    const baseColors = [
      'hsla(120,100%,80%,0.1)', // Green (default and 1)
      'hsla(180,100%,80%,0.1)', // Cyan (2)
      'hsla(240,100%,80%,0.1)', // Blue (3)
      'hsla(60,100%,80%,0.1)',  // Yellow (4)
      'hsla(0,100%,80%,0.1)',   // Red (5)
      'hsla(300,100%,80%,0.1)'  // Magenta (6)
    ];

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function randomHsl() {
      const baseHsl = baseColors[currentBaseColorIndex];
      const match = baseHsl.match(/hsla\((\d+),/);
      const hue = match ? parseInt(match[1]) + Math.random() * 60 - 30 : 0;
      return `hsla(${hue},100%,80%,0.1)`;
    }

    class Shape {
      color: string;
      scale: number;
      rotationSpeed: number;
      x: number;
      y: number;

      constructor() {
        this.color = randomHsl();
        this.scale = Math.random() * 0.4 + 0.1;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(width, height) * 0.3;
        this.x = Math.cos(angle) * radius + width / 2;
        this.y = Math.sin(angle) * radius + height / 2;
      }

      draw() {
        const t = Date.now() * 0.001;
        const size = width * this.scale;

        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;

        for (let i = 0; i < 2; i++) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(t * this.rotationSpeed);
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function init() {
      shapes = [];
      for (let i = 0; i < 7; i++) {
        shapes.push(new Shape());
      }
    }
    init();

    function frame() {
      ctx.clearRect(0, 0, width, height);
      shapes.forEach(shape => shape.draw());

      requestAnimationFrame(frame);
    }
    frame();

    function handlePsychoticCounter(event: CustomEvent) {
      const number = event.detail;
      console.log(`QuantumBackground received number: ${number}`); // Log the received number
      const index = number - 1;
      if (index >= 0 && index < baseColors.length) {
        currentBaseColorIndex = index;
        init();
      }
    }

    window.addEventListener('psychoticCounter', handlePsychoticCounter as EventListener);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('psychoticCounter', handlePsychoticCounter as EventListener);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1]">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div id="info" ref={infoRef} style={{ position: 'absolute', top: '10px', left: '10px', color: '#000', fontFamily: 'monospace', fontSize: '14px', opacity: 0.7 }}></div>
    </div>
  );
};

export default QuantumBackground;
