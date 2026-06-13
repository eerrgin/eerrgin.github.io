import { useEffect, useState } from 'react';

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="py-10 text-center text-gray-600 text-xs font-mono uppercase tracking-widest border-t border-white/5 bg-black/50">
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
        <a href="#" className="hover:text-white transition-colors">Cookies</a>
      </div>
      <p>© {year} Ergin Kaplan // Curious Dev // End of Line.</p>
    </footer>
  );
}
