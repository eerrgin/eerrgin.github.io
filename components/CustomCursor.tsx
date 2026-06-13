import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 768) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const interactiveElements = document.querySelectorAll('a, button, input, [data-cursor-hover]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => setIsHovering(true));
      el.addEventListener('mouseleave', () => setIsHovering(false));
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth <= 768) return null;

  return (
    <>
      {/* Spotlight */}
      <div
        className="fixed inset-0 pointer-events-none z-[-1] transition-all duration-100"
        style={{
          background: `radial-gradient(circle 600px at ${position.x}px ${position.y}px, rgba(34, 211, 238, 0.07), transparent 80%)`,
        }}
      />

      {/* Cursor dot */}
      <div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-all duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: '#00f0ff',
          boxShadow: '0 0 12px #00f0ff, 0 0 20px #00f0ff',
          transform: `translate(${position.x - 3}px, ${position.y - 3}px)`,
        }}
      />

      {/* Cursor outline */}
      <div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          width: isHovering ? '70px' : '40px',
          height: isHovering ? '70px' : '40px',
          border: '1px solid rgba(0, 240, 255, 0.5)',
          backgroundColor: isHovering ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
          backdropFilter: isHovering ? 'blur(2px)' : 'none',
          transform: `translate(${position.x - (isHovering ? 35 : 20)}px, ${position.y - (isHovering ? 35 : 20)}px)`,
        }}
      />
    </>
  );
}
