import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#lab', label: 'Lab' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#ai', label: 'AI Core' },
  { href: '#terminal', label: 'Console' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 px-6 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'py-3 bg-[rgba(5,5,10,0.85)] backdrop-blur-xl' : 'py-5'
        }`}
      >
        <a href="#home" className="text-2xl font-black tracking-tighter text-white neon-text">
          eerrgin<span className="text-cyan-400">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-gray-300">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-cyan-400 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://eerrgin.github.io/message.htm"
            className="hover:text-cyan-400 transition-colors duration-200"
          >
            Contact
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-white text-2xl focus:outline-none z-50"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-7 text-2xl font-bold uppercase tracking-widest text-gray-300 transition-all duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map(link => (
          <a
            key={link.href}
            href={link.href}
            onClick={closeMobile}
            className="hover:text-cyan-400 transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
        <a
          href="https://eerrgin.github.io/message.htm"
          onClick={closeMobile}
          className="hover:text-cyan-400 transition-colors duration-200"
        >
          Contact
        </a>
      </div>
    </>
  );
}
