import { useState, useRef, useEffect } from 'react';

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string) => Promise<unknown>;
      };
    };
  }
}

interface TerminalLine {
  type: 'input' | 'output' | 'system';
  content: string;
  icon?: string;
  color?: string;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: "Welcome to eerrgin.OS v4.0.", color: 'text-gray-300' },
    { type: 'system', content: "Type 'help' to explore directives. The 'ai' command now talks to a real language model.", color: 'text-gray-300' },
  ]);
  const [input, setInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  const detectLanguage = (text: string): string => {
    const tr = /[çğıöşüİĞÖŞÜ]/i;
    const ru = /[а-яА-Я]/i;
    if (tr.test(text)) return 'tr-TR';
    if (ru.test(text)) return 'ru-RU';
    return 'en-US';
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectLanguage(text);
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const extractAIText = (response: unknown): string => {
    try {
      if (typeof response === 'string') return response;
      if (response && typeof response === 'object') {
        const resp = response as Record<string, unknown>;
        if (resp.message && typeof resp.message === 'object') {
          const msg = resp.message as Record<string, unknown>;
          if (typeof msg.content === 'string') return msg.content;
          if (Array.isArray(msg.content)) {
            return msg.content.map((b: { text?: string }) => b.text || '').join(' ');
          }
        }
        if (typeof resp.text === 'string') return resp.text;
      }
      return String(response);
    } catch {
      return "Hmm, I couldn't parse that response.";
    }
  };

  const askAI = async (prompt: string): Promise<string> => {
    if (!window.puter?.ai?.chat) {
      return "The AI core couldn't initialize. Check your connection or ad-blocker.";
    }

    try {
      const response = await window.puter.ai.chat(prompt);
      return extractAIText(response) || "I didn't get a usable answer.";
    } catch {
      return 'The AI core hit a snag. Try again in a moment.';
    }
  };

  const handleCommand = async (cmd: string) => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const primary = parts[0];

    setLines((prev) => [...prev, { type: 'input', content: `guest@eerrgin:~$ ${cmd}` }]);

    switch (primary) {
      case 'help':
        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: `Available System Directives:
  whoami       - Query profile payload data.
  skills       - List loaded core proficiencies.
  thermal      - Pull real-time sandbox engine hardware thermals.
  ai [msg]     - Ask the live AI core a question (real model, speaks reply).
  system       - Read environment matrix details.
  contact      - Open direct handshake pipeline channel.
  clear        - Purge terminal output logs.`,
            color: 'text-green-400',
          },
        ]);
        break;

      case 'whoami':
        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: 'Ergin Kaplan. A curious developer pulling modern system layers apart to analyze internal engines. No generic corporate facades here.',
            color: 'text-gray-300',
          },
        ]);
        break;

      case 'skills':
        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: 'Python, Advanced JS, Neural Pipeline Orchestration, Runtime Fuzzing, System Automation Architecture.',
            color: 'text-gray-300',
          },
        ]);
        break;

      case 'thermal': {
        const cpuTemp = Math.floor(Math.random() * 15) + 42;
        const gpuTemp = Math.floor(Math.random() * 20) + 55;
        const aiTemp = 45;
        const bar = (val: number) => {
          const blocks = Math.floor(val / 10);
          return `[${'#'.repeat(blocks)}${'-'.repeat(10 - blocks)}] ${val}C`;
        };

        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: `Fetching local hardware sandbox performance profiles...
  CPU Core 01: ${bar(cpuTemp)} STABLE
  GPU Cluster: ${bar(gpuTemp)} LOAD_ACTIVE
  AI Engine:   ${bar(aiTemp)} IDLE`,
            color: 'text-gray-300',
          },
        ]);
        speak('Thermal scan complete. All systems stable.');
        break;
      }

      case 'ai': {
        const query = cmd.substring(3).trim();
        if (!query) {
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: "Usage: ai [your question] -> e.g., 'ai what should I build next?'",
              color: 'text-gray-500',
            },
          ]);
          break;
        }

        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: '[AI Core]: thinking...',
            color: 'text-purple-400',
          },
        ]);

        const answer = await askAI(query);

        setLines((prev) => [
          ...prev.slice(0, -1),
          {
            type: 'output',
            content: `[AI Core]: ${answer}`,
            color: 'text-purple-400',
          },
        ]);
        speak(answer);
        break;
      }

      case 'system':
        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: `  Host: eerrgin.github.io // Architecture: WebContainers x64
  Kernel: LiveAICore-v4.0 // Status: NOMINAL
  Environment: Production Grid Matrix`,
            color: 'text-gray-300',
          },
        ]);
        break;

      case 'contact':
        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: 'Signal link available at: https://eerrgin.github.io/message.htm',
            color: 'text-cyan-400',
          },
        ]);
        break;

      case 'sudo':
      case 'rm':
        setLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: 'Access Denied. Sandbox bypass prevention active. This incident will be reported.',
            color: 'text-red-500',
          },
        ]);
        break;

      case 'clear':
        setLines([]);
        break;

      default:
        if (cmd.trim()) {
          setLines((prev) => [
            ...prev,
            {
              type: 'output',
              content: `Directive not recognized: '${cmd}'. Input 'help' to see valid operations.`,
              color: 'text-red-400',
            },
          ]);
        }
    }

    setInput('');
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
    }
  };

  return (
    <section id="terminal" className="py-28 relative z-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 opacity-0 translate-y-8 transition-all duration-700 [animation:fadeInUp_0.7s_ease_forwards]">
          <span className="text-purple-400 text-[10px] font-mono tracking-[0.2em] bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full">
            INTERACTIVE CONSOLE
          </span>
          <h2 className="text-5xl font-black mt-6">
            Talk to the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              System
            </span>
          </h2>
        </div>

        <div className="glass-card rounded-2xl p-1 opacity-0 translate-y-8 transition-all duration-700 [animation:fadeInUp_0.7s_ease_0.2s_forwards]">
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-4 text-xs text-gray-400 font-mono">guest@eerrgin: ~/system</div>
            </div>

            {/* Terminal Output */}
            <div ref={terminalRef} className="p-6 h-80 overflow-y-auto font-mono text-sm space-y-1">
              {lines.map((line, i) => (
                <div key={i} className={line.color || 'text-gray-400'}>
                  {line.content.split('\n').map((part, j) => (
                    <div key={j}>{part}</div>
                  ))}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 flex items-center font-mono text-sm bg-gray-900">
              <span className="text-green-400 mr-2">guest@eerrgin:~$</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none text-gray-100 focus:outline-none w-full"
                autoFocus
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
