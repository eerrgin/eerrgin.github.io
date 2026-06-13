import { useEffect, useRef } from 'react';
import { Network, Gauge, FlaskConical } from 'lucide-react';

const modules = [
  {
    icon: Network,
    title: 'Autonomous Agents',
    description: 'Self-evolving AI pipelines, multi-agent orchestration, and swarm intelligence algorithms.',
    color: 'cyan',
    tags: ['LLM_Mesh', 'ReAct'],
  },
  {
    icon: Gauge,
    title: 'Rapid Engine',
    description: 'High-performance real-time simulation, ultra low-latency processing, and infinite scalability.',
    color: 'orange',
    tags: ['Sub-ms', 'WASM'],
  },
  {
    icon: FlaskConical,
    title: 'Zero-Day Tinkering',
    description: 'Sandboxed environments for deep protocol analysis, code fuzzing, and breaking stuff to see how it works.',
    color: 'purple',
    tags: ['Sandbox', 'Fuzzing'],
  },
];

export default function Lab() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            entry.target.classList.remove('opacity-0', 'translate-y-8', 'scale-95');
          }
        });
      },
      { threshold: 0.1 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card || window.innerWidth <= 768) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s ease';
  };

  const handleMouseEnter = (index: number) => {
    const card = cardRefs.current[index];
    if (card) card.style.transition = 'none';
  };

  return (
    <section id="lab" className="py-28 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 opacity-0 translate-y-8 scale-95 transition-all duration-700 [animation:fadeInUp_0.7s_ease_forwards]">
          <span className="text-cyan-400 text-[10px] font-mono tracking-[0.2em] bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 rounded-full">
            R&D MODULES
          </span>
          <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
            Experimental{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Sandbox
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const colorClass =
              module.color === 'cyan'
                ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 group-hover:bg-cyan-400 group-hover:text-black'
                : module.color === 'orange'
                ? 'text-orange-400 bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500 group-hover:text-black'
                : 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500 group-hover:text-black';

            const tagColor =
              module.color === 'cyan'
                ? 'text-cyan-400/80 bg-cyan-400/5 border-cyan-400/20'
                : module.color === 'orange'
                ? 'text-orange-400/80 bg-orange-500/5 border-orange-500/20'
                : 'text-purple-400/80 bg-purple-500/5 border-purple-500/20';

            return (
              <div
                key={index}
                ref={(el) => { cardRefs.current[index] = el; }}
                className="glass-card p-8 rounded-3xl group opacity-0 translate-y-8 scale-95 transition-all duration-700 cursor-pointer"
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl mb-6 transition-all duration-300 ${colorClass}`}
                >
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight">{module.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  {module.description}
                </p>

                <div className="mt-6 flex gap-2 text-[10px] font-mono uppercase">
                  {module.tags.map((tag, i) => (
                    <span key={i} className={`px-3 py-1 rounded-md border ${tagColor}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
