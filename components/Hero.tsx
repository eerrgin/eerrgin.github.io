import { useEffect, useState, useRef } from 'react';
import { Github, Radio, Brain } from 'lucide-react';

const titles = ['Curious Developer', 'AI Tinkerer', 'Open Source Explorer', 'Code Alchemist'];

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [colored, setColored] = useState(false);
  const [visitCount, setVisitCount] = useState(247);
  const [time, setTime] = useState({ h: '--', m: '--', s: '--' });
  const imgRef = useRef<HTMLImageElement>(null);

  // Typing effect
  useEffect(() => {
    const currentTitle = titles[titleIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentTitle.length) {
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTitleIndex((titleIndex + 1) % titles.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, titleIndex]);

  // Visit counter
  useEffect(() => {
    const stored = localStorage.getItem('sys_visits_v3');
    const count = stored ? parseInt(stored) + 1 : 247;
    localStorage.setItem('sys_visits_v3', count.toString());
    setVisitCount(count);
  }, []);

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime({
        h: now.getHours().toString().padStart(2, '0'),
        m: now.getMinutes().toString().padStart(2, '0'),
        s: now.getSeconds().toString().padStart(2, '0'),
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleColor = () => setColored(!colored);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono font-bold mb-8 tracking-widest backdrop-blur-sm">
            <span className="animate-pulse">SYSTEM_READY // v4.0 // LIVE_AI_CORE_ONLINE</span>
          </div>

          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 leading-none hover:glitch-text cursor-default">
            eerrgin<span className="text-cyan-400 neon-text">.</span>
          </h1>

          <div className="text-2xl md:text-3xl text-gray-300 font-light mb-6 h-14">
            <span>{titles[titleIndex].substring(0, charIndex)}</span>
            <span className="typing-cursor" />
          </div>

          <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-4 max-w-lg font-light">
            Curious developer tinkering with AI, rapid engines, and experimental code boundaries.
          </p>

          <p className="text-sm md:text-base text-cyan-400/80 leading-relaxed mb-10 max-w-lg font-mono border-l-2 border-cyan-400/50 pl-4 py-1">
            [LOG: 23:42] "Ergin Kaplan here. Some nights I code. I bring random ideas to life, tinker with AI, and experiment with everything that interests me."
          </p>

          <div className="flex flex-wrap gap-5">
            <a
              href="https://github.com/eerrgin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-black font-black rounded-xl text-sm tracking-wide uppercase flex items-center gap-3 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300"
            >
              <Github className="w-5 h-5" /> Init_GitHub
            </a>

            <a
              href="https://eerrgin.github.io/message.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 backdrop-blur-md border border-cyan-400/50 text-cyan-400 font-bold rounded-xl text-sm tracking-wide uppercase flex items-center gap-3 hover:bg-cyan-400 hover:text-black hover:border-transparent hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300"
            >
              <Radio className="w-5 h-5" /> Ping_Me
            </a>

            <a
              href="#ai"
              className="px-8 py-4 backdrop-blur-md border border-purple-500/50 text-purple-300 font-bold rounded-xl text-sm tracking-wide uppercase flex items-center gap-3 hover:bg-purple-500 hover:text-black hover:border-transparent hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300"
            >
              <Brain className="w-5 h-5" /> Ask_The_AI
            </a>
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-14 pt-8 border-t border-white/5">
            <div>
              <div className="text-3xl font-black text-cyan-400">+{visitCount}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Explored Nodes</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {time.h}:{time.m} <span className="text-xs text-gray-500 animate-pulse">{time.s}</span>
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Local Cycle</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-400">infinity</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Limits</div>
            </div>
          </div>
        </div>

        {/* Profile Image */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="relative group">
            {/* Glow Effect */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-40 pulse-glow"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #7000ff, #00f0ff)',
                filter: 'blur(35px)',
              }}
            />

            {/* Image Container */}
            <div className="relative overflow-hidden rounded-3xl hover:scale-[1.02] transition-transform duration-500">
              <img
                ref={imgRef}
                src="https://raw.githubusercontent.com/eerrgin/eerrgin.github.io/refs/heads/main/12.jpg"
                alt="Ergin Kaplan"
                onClick={toggleColor}
                className={`w-72 h-72 md:w-[420px] md:h-[420px] object-cover rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-500 ${
                  colored
                    ? 'grayscale-0 saturate-120 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                    : 'grayscale contrast-110'
                }`}
              />

              {/* Holographic Overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.15), transparent)',
                  transform: 'translateX(-100%)',
                  animation: 'holoScan 0.8s ease forwards',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes holoScan {
          to { transform: translateX(100%); }
        }
        .group:hover .group-hover\\:opacity-100 {
          animation: holoScan 0.8s ease forwards;
        }
      `}</style>
    </section>
  );
}
