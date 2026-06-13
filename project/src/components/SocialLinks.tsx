import { Instagram, Facebook, Terminal, Code } from 'lucide-react';

interface SocialLinksProps {
  matrixActive: boolean;
  onToggleMatrix: () => void;
}

export default function SocialLinks({ matrixActive, onToggleMatrix }: SocialLinksProps) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* System Status */}
      <div className="glass-premium rounded-full px-3 py-1.5 flex items-center gap-2 border-green-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-gray-300 font-mono text-[10px] tracking-widest">SYS.ONLINE</span>
      </div>

      {/* Matrix Toggle */}
      <button
        onClick={onToggleMatrix}
        className={`w-12 h-12 glass-premium rounded-full flex items-center justify-center transition-all duration-300 ${
          matrixActive
            ? 'text-cyan-400 border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
            : 'text-gray-400 hover:text-cyan-400'
        }`}
        title="Toggle Matrix Mode"
      >
        <Code className="w-5 h-5" />
      </button>

      {/* Instagram */}
      <a
        href="https://instagram.com/eerrgin"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 glass-premium rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
        aria-label="Instagram"
      >
        <Instagram className="w-5 h-5" />
      </a>

      {/* Facebook */}
      <a
        href="https://facebook.com/eerrgin"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 glass-premium rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300"
        aria-label="Facebook"
      >
        <Facebook className="w-5 h-5" />
      </a>

      {/* Dev.to */}
      <a
        href="https://dev.to"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 glass-premium rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all duration-300"
        aria-label="Dev.to"
      >
        <Terminal className="w-5 h-5" />
      </a>
    </div>
  );
}
