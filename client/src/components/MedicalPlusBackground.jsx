import { useEffect, useRef } from "react";

export default function MedicalPlusBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let particles = [];
    let lastMousePos = { x: 0, y: 0 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class PlusParticle {
      constructor(x, y) {
        // Scatter slightly around mouse location so they don't spawn in a clump
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDistance = Math.random() * 25;
        this.x = x + Math.cos(offsetAngle) * offsetDistance;
        this.y = y + Math.sin(offsetAngle) * offsetDistance;

        // Increased size (20px to 32px)
        this.size = Math.random() * 12 + 20; 
        this.alpha = 0.85;
        this.decay = Math.random() * 0.008 + 0.006; // Smooth fade-out
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2 - 0.3; // Gentle drift
        this.rotation = (Math.random() - 0.5) * 0.4; // Subtle angle
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const half = this.size / 2;
        const thickness = Math.max(4, this.size / 3.5);

        ctx.fillStyle = "#08679F"; // HMS Medical Blue
        ctx.shadowColor = "rgba(8, 103, 159, 0.25)";
        ctx.shadowBlur = 10;

        // Vertical bar
        ctx.fillRect(-thickness / 2, -half, thickness, this.size);
        // Horizontal bar
        ctx.fillRect(-half, -thickness / 2, this.size, thickness);

        ctx.restore();
      }
    }

    const handleMouseMove = (e) => {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      const distance = Math.hypot(dx, dy);

      // Only spawn a new particle if the cursor has moved at least 35px
      if (distance > 35) {
        particles.push(new PlusParticle(e.clientX, e.clientY));
        lastMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
}