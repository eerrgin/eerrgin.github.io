import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[3px] z-[10000] transition-all duration-100"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #00f0ff, #7000ff)',
        boxShadow: '0 0 10px rgba(0,240,255,0.6)',
      }}
    />
  );
}
