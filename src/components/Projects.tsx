export default function Projects() {
  const projects = [
    {
      number: '01',
      title: 'Neural Interface Design',
      description: 'Low-latency signal processing pipeline for real-time brain-computer interaction.',
      tags: ['Python', 'TensorFlow'],
      color: 'cyan',
    },
    {
      number: '02',
      title: 'Autonomous Drone Swarm',
      description: 'Simultaneous mission planning and collision avoidance for 10+ drones.',
      tags: ['C++', 'ROS2'],
      color: 'purple',
    },
    {
      number: '03',
      title: 'Live AI Core (this site)',
      description: 'A browser-native AI assistant embedded directly in this page — no backend, no API keys, just JavaScript.',
      tags: ['JS', 'LLM'],
      color: 'pink',
      link: '#ai',
    },
  ];

  return (
    <section id="projects" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14 opacity-0 translate-y-8 transition-all duration-700 [animation:fadeInUp_0.7s_ease_forwards]">
          <h3 className="text-4xl font-black">
            Latest <span className="text-cyan-400">Experiments</span>
          </h3>
          <p className="text-gray-500 mt-3 font-mono text-xs tracking-widest uppercase">
            pushing the boundaries of code
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const colorClass =
              project.color === 'cyan'
                ? 'text-cyan-400'
                : project.color === 'purple'
                ? 'text-purple-400'
                : 'text-pink-400';

            return (
              <a
                key={index}
                href={project.link || '#'}
                className="glass-card p-8 rounded-3xl group block no-inherit opacity-0 translate-y-8 scale-95 transition-all duration-700 hover:border-cyan-400/30"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.7s ease forwards',
                }}
              >
                <span className={`text-xs font-mono ${colorClass}`}>{project.number}</span>
                <h4 className="text-xl font-bold mt-2">{project.title}</h4>
                <p className="text-gray-400 text-sm mt-2 leading-relaxed">{project.description}</p>
                <div className="flex gap-2 mt-4">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white/5 px-3 py-1 rounded-full font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
