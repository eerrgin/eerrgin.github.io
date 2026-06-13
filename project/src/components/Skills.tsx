import { useEffect, useRef, useState } from 'react';

const skills = [
  { name: 'Python', level: 90 },
  { name: 'JavaScript / Web', level: 85 },
  { name: 'AI & LLM Tooling', level: 80 },
  { name: 'Automation & Scripting', level: 88 },
  { name: 'Systems & Fuzzing', level: 70 },
  { name: 'Curiosity', level: 100 },
];

export default function Skills() {
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent border-y border-white/5"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 opacity-0 translate-y-8 transition-all duration-700 [animation:fadeInUp_0.7s_ease_forwards]">
          <span className="text-purple-400 text-[10px] font-mono tracking-[0.2em] bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full">
            CORE PROFICIENCIES
          </span>
          <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight">
            Loaded{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Modules
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="opacity-0 translate-y-4 transition-all duration-500"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease forwards',
              }}
            >
              <div className="flex justify-between mb-2 text-sm font-mono">
                <span className="text-gray-300">{skill.name}</span>
                <span className="text-cyan-400">{skill.level}%</span>
              </div>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{ width: animated ? `${skill.level}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
