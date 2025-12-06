import React, { useEffect, useState } from 'react';

export default function ParallaxBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize coordinates -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      // Use requestAnimationFrame for smoother updates if needed, 
      // but state update is usually fast enough for simple CSS transforms
      requestAnimationFrame(() => {
        setMousePos({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Layer 1 - Slow moving big shapes */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-500/20 rounded-full blur-3xl transition-transform duration-700 ease-out mix-blend-multiply"
        style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-500/20 rounded-full blur-3xl transition-transform duration-700 ease-out mix-blend-multiply"
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      />
      
      {/* Layer 2 - Medium moving shapes */}
      <div 
        className="absolute top-[20%] right-[20%] w-[25vw] h-[25vw] bg-cyan-400/30 rounded-full blur-3xl transition-transform duration-500 ease-out mix-blend-multiply"
        style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
      />
      
      {/* Layer 3 - Faster moving small accents */}
      <div 
        className="absolute bottom-[30%] left-[20%] w-[15vw] h-[15vw] bg-gov-accent/30 rounded-full blur-2xl transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` }}
      />
    </div>
  );
}
