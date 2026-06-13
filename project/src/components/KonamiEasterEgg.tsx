import { useState, useEffect } from 'react';
import { Unlock } from 'lucide-react';

export default function KonamiEasterEgg() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const konamiCode = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let position = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === konamiCode[position]) {
        position++;
        if (position === konamiCode.length) {
          setIsActive(true);
          position = 0;
        }
      } else {
        position = key === konamiCode[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity duration-300">
      <div className="glass-card p-10 rounded-3xl text-center max-w-md mx-4">
        <Unlock className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black mb-2 neon-text">DEVELOPER MODE UNLOCKED</h3>
        <p className="text-gray-400 text-sm font-mono mb-6">
          You found the hidden sequence. Curiosity confirmed.
        </p>
        <button
          onClick={() => setIsActive(false)}
          className="px-6 py-2 bg-cyan-400 text-black font-bold rounded-xl text-sm uppercase hover:bg-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
