import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function AudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);
  const initiated = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(console.warn);
    }
    setPlaying(!playing);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Auto-start on first interaction
  useEffect(() => {
    const startOnInteraction = () => {
      if (!initiated.current && audioRef.current) {
        initiated.current = true;
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
        document.removeEventListener('click', startOnInteraction);
      }
    };

    document.addEventListener('click', startOnInteraction);
    return () => document.removeEventListener('click', startOnInteraction);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 glass-premium px-3 py-2 rounded-full">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="https://github.com/eerrgin/eerrgin.github.io/raw/refs/heads/main/7mix.mp3"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        aria-label={playing ? 'Pause music' : 'Play music'}
      >
        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
      </button>

      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hidden sm:block"
        style={{ accentColor: '#00f0ff' }}
        aria-label="Volume"
      />
    </div>
  );
}
