import { useEffect, useState } from 'react';
import CustomCursor from './components/CustomCursor';
import ParticleCanvas from './components/ParticleCanvas';
import MatrixRain from './components/MatrixRain';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Lab from './components/Lab';
import Skills from './components/Skills';
import Projects from './components/Projects';
import AICore from './components/AICore';
import Terminal from './components/Terminal';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import SocialLinks from './components/SocialLinks';
import KonamiEasterEgg from './components/KonamiEasterEgg';

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string) => Promise<unknown>;
      };
    };
  }
}

function App() {
  const [matrixActive, setMatrixActive] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 5000);

    return () => clearInterval(glitchInterval);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen bg-[#030303] text-gray-100 ${glitchActive ? 'glitch-active' : ''}`}>
      <ScrollProgress />
      <div className="scanlines" />
      <ParticleCanvas />
      <MatrixRain active={matrixActive} />

      <CustomCursor />
      <div className="bg-grid" />

      <Navbar />

      <main>
        <Hero />
        <About />
        <Lab />
        <Skills />
        <Projects />
        <AICore />
        <Terminal />
        <Contact />
      </main>

      <Footer />
      <AudioPlayer />
      <BackToTop />
      <SocialLinks matrixActive={matrixActive} onToggleMatrix={() => setMatrixActive(!matrixActive)} />
      <KonamiEasterEgg />
    </div>
  );
}

export default App;
