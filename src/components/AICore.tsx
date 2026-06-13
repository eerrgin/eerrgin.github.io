import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Volume2, VolumeX } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export default function AICore() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi, I'm the AI core running on this page. Ask me anything — I'm a real language model, not a script.",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const detectLanguage = (text: string): string => {
    const tr = /[çğıöşüİĞÖŞÜ]/i;
    const ru = /[а-яА-Я]/i;
    const de = /\b(ich|ist|und|der|die|das|nicht|du)\b/i;
    const fr = /\b(le|la|les|et|est|un|une|pour|dans)\b/i;

    if (tr.test(text)) return 'tr-TR';
    if (ru.test(text)) return 'ru-RU';
    if (de.test(text)) return 'de-DE';
    if (fr.test(text)) return 'fr-FR';
    return 'en-US';
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectLanguage(text);
    utterance.pitch = 0.95;
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang.startsWith(utterance.lang.substring(0, 2)) &&
        (v.name.includes('Google') || v.name.includes('Natural'))
    );
    if (matchedVoice) utterance.voice = matchedVoice;

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
            return msg.content
              .map((b: { text?: string }) => b.text || '')
              .join(' ');
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
    if (typeof window.puter === 'undefined' || !window.puter?.ai?.chat) {
      return "The AI core couldn't initialize. The AI library failed to load — check your connection or ad-blocker.";
    }

    try {
      const response = await window.puter.ai.chat(prompt);
      const text = extractAIText(response);
      return text?.trim() || "I didn't get a usable answer — try rephrasing?";
    } catch (err) {
      console.error('AI core error:', err);
      return 'The AI core hit a snag. Give it another try in a moment.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { text, sender: 'user' }]);
    setLoading(true);

    const answer = await askAI(text);
    setMessages((prev) => [...prev, { text: answer, sender: 'ai' }]);
    setLoading(false);

    if (voiceEnabled) speak(answer);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <section id="ai" className="py-28 relative z-10 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent border-y border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 opacity-0 translate-y-8 transition-all duration-700 [animation:fadeInUp_0.7s_ease_forwards]">
          <span className="text-purple-400 text-[10px] font-mono tracking-[0.2em] bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full">
            LIVE AI CORE
          </span>
          <h2 className="text-5xl font-black mt-6">
            Ask The{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              System
            </span>
          </h2>
          <p className="text-gray-400 mt-4 font-light text-sm max-w-xl mx-auto">
            A real AI assistant running directly in your browser. Ask it anything — about this site, about code, or whatever's on your mind.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-1 opacity-0 translate-y-8 transition-all duration-700 [animation:fadeInUp_0.7s_ease_0.2s_forwards]">
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <Brain className="w-4 h-4 text-purple-400" />
              <div className="text-xs text-gray-400 font-mono">ai-core.eerrgin // live session</div>
              <div className="ml-auto flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono cursor-pointer">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-1 rounded transition-colors ${voiceEnabled ? 'text-cyan-400' : 'text-gray-500'}`}
                  >
                    {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                  SPEAK
                </label>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="p-5 h-80 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-4 py-3 text-sm max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'chat-bubble-user self-end text-gray-100'
                      : 'chat-bubble-ai self-start text-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {loading && (
                <div className="chat-bubble-ai rounded-xl px-4 py-3 text-sm max-w-[85%] self-start flex gap-1">
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                  <span className="typing-dot">.</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-5 pb-5 pt-2 flex items-center gap-3 bg-gray-900">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask something..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-cyan-400/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-cyan-400 text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 font-mono mt-4 uppercase tracking-widest">
          Powered by a free browser-native model - runs entirely client-side
        </p>
      </div>
    </section>
  );
}
