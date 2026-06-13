import { Terminal, ArrowRightToLine } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="glass-card p-12 rounded-[2rem] inline-block w-full relative overflow-hidden group">
          {/* Gradient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-400/10 blur-[60px] rounded-full" />

          <Terminal className="w-10 h-10 text-cyan-400 mb-6 relative z-10 group-hover:rotate-12 transition-transform duration-500" />

          <h3 className="text-3xl font-black mb-3 relative z-10">Dev Community</h3>
          <p className="text-gray-400 mb-8 font-light relative z-10">
            I hang out with indie devs, open-source enthusiasts, and tech explorers deep inside the code.
          </p>

          <a
            href="https://dev.to"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-3 text-black bg-cyan-400 font-bold px-8 py-3.5 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          >
            Join the System
            <ArrowRightToLine className="w-5 h-5" />
          </a>

          <p className="text-[10px] text-gray-600 mt-6 font-mono uppercase tracking-widest relative z-10">
            dev.to - global tech node
          </p>
        </div>
      </div>
    </section>
  );
}
