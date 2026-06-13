import { useEffect, useRef } from 'react';

const timeline = [
  {
    label: 'Origin',
    color: 'cyan',
    title: 'First lines of code, just for fun',
    description: 'It started with small scripts that broke constantly — and the stubborn need to figure out why. No grand plan, just curiosity about how things actually work under the hood.',
  },
  {
    label: 'Now',
    color: 'purple',
    title: 'Nights spent in the AI sandbox',
    description: 'This site is itself one of those experiments — built from scratch, broken on purpose, and rebuilt better. I work on AI tooling, automation, and rapid prototypes purely as a hobby, with no commercial agenda.',
  },
  {
    label: 'Next',
    color: 'pink',
    title: 'Whatever breaks next',
    description: 'No fixed destination — just the next interesting rabbit hole. New languages, new frameworks, new ways to make a machine talk back. Open-source, collaborative, and built in public.',
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal-item');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 reveal-item opacity-0 translate-y-8 transition-all duration-700">
          <span className="text-cyan-400 text-[10px] font-mono tracking-[0.2em] bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 rounded-full">
            PROCESS LOG
          </span>
          <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
            How I <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Got Here</span>
          </h2>
          <p className="text-gray-400 mt-4 font-light max-w-xl mx-auto">
            No bootcamp marketing pitch, no corporate roadmap. Just a timeline of late-night curiosity.
          </p>
        </div>

        <div className="relative pl-10">
          {/* Vertical Line */}
          <div
            className="absolute left-3 top-0 bottom-0 w-px"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(0,240,255,0.4), transparent)',
            }}
          />

          {timeline.map((item, index) => (
            <div
              key={index}
              className="relative mb-12 last:mb-0 reveal-item opacity-0 translate-y-8 transition-all duration-700"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Dot */}
              <div
                className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full ${
                  item.color === 'cyan'
                    ? 'bg-cyan-400 shadow-[0_0_0_4px_rgba(0,240,255,0.1),0_0_15px_rgba(0,240,255,0.6)]'
                    : item.color === 'purple'
                    ? 'bg-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.1),0_0_15px_rgba(168,85,247,0.6)]'
                    : 'bg-pink-500 shadow-[0_0_0_4px_rgba(236,72,153,0.1),0_0_15px_rgba(236,72,153,0.6)]'
                }`}
              />

              <span
                className={`text-[10px] font-mono uppercase tracking-widest ${
                  item.color === 'cyan'
                    ? 'text-cyan-400'
                    : item.color === 'purple'
                    ? 'text-purple-400'
                    : 'text-pink-400'
                }`}
              >
                {item.label}
              </span>

              <h3 className="text-xl font-bold mt-1 mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light max-w-2xl">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
