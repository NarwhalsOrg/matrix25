"use client";
import React, { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const equations = [
    '∫ f(x)dx',
    'Σ(xi - μ)²',
    '∇²φ = 0',
    'det(A) ≠ 0',
    '|A| = Σ(-1)^i',
    'Ax = λx',
    'A⁻¹A = I',
    'tr(AB) = tr(BA)',
    '∂f/∂x = 0',
    'lim(x→∞) f(x)',
    'e^(iπ) + 1 = 0',
    '∮ F·dr = 0',
    '||v|| = √(v·v)',
    'rank(A) ≤ min(m,n)',
    'P(A∩B) = P(A)P(B)',
  ];

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
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      equation: string;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
      size: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        equation: equations[Math.floor(Math.random() * equations.length)],
        opacity: Math.random() * 0.3 + 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 16 + 12,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        // Wrap around screen
        if (particle.x < -100) particle.x = canvas.width + 100;
        if (particle.x > canvas.width + 100) particle.x = -100;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;

        // Draw equation
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.font = `${particle.size}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(34, 197, 94, ${particle.opacity})`;
        ctx.textAlign = 'center';
        ctx.fillText(particle.equation, 0, 0);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
};

export default MatrixBackground;