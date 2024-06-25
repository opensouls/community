import React, { useEffect, useRef } from 'react';

const DarkModeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    class Particle {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      ctx: CanvasRenderingContext2D;

      constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = Math.random() * 4 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > this.ctx.canvas.width) {
          this.speedX = -this.speedX;
        }

        if (this.y < 0 || this.y > this.ctx.canvas.height) {
          this.speedY = -this.speedY;
        }
      }

      draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'; // Matrix green color
        this.ctx.fill();
        this.ctx.closePath();
      }
    }

    let particles: Particle[] = [];

    function init() {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle(canvas as HTMLCanvasElement, ctx as CanvasRenderingContext2D));
      }
    }

    function connect() {
      if (!ctx) return; // Add null check for ctx

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)'; // Matrix green color
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!canvas || !ctx) return; // Add null check for canvas and ctx

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      connect();

      requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      resizeCanvas();
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-black opacity-75">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default DarkModeBackground;