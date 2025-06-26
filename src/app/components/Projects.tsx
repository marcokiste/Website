import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ProjectsProps {
  onClose: () => void;
}

const PROJECTS = [
  {
    name: 'Projekt Alpha',
    description: 'Eine fortschrittliche webbasierte KI-Anwendung zur Datenanalyse und Vorhersage. Entwickelt mit React, Python und TensorFlow.',
    image: '/images/projects/IMG_8903.jpg',
  },
  {
    name: 'Projekt Beta',
    description: 'Microservices-Architektur für hochskalierbare Cloud-Anwendungen. Implementiert mit Docker, Kubernetes und Node.js.',
    image: '/images/cheese.png',
  },
  {
    name: 'Projekt Gamma',
    description: 'Cross-Platform Mobile App mit React Native. Features: Offline-Modus, Push-Benachrichtigungen, Real-time Updates.',
    image: '/images/Map.png',
  },
  {
    name: 'Projekt Delta',
    description: 'IoT Dashboard zur Überwachung von Sensordaten in Echtzeit. Visualisierung mit D3.js und MQTT-Anbindung.',
    image: '/images/projects/IMG_8910.jpg',
  },
  {
    name: 'Projekt Epsilon',
    description: '3D-gedruckte Robotikplattform mit Steuerung über eine Weboberfläche. Raspberry Pi, Python und ROS.',
    image: '/images/projects/IMG_8911.jpg',
  },
  {
    name: 'Projekt Zeta',
    description: 'Portfolio-Website mit Next.js, Tailwind CSS und animierten SVG-Elementen. Responsive und performant.',
    image: '/images/projects/IMG_8912.jpg',
  },
  {
    name: 'Projekt Theta',
    description: 'Augmented Reality App für Architektur-Visualisierung. Entwickelt mit Unity und ARKit.',
    image: '/images/projects/IMG_8913.jpg',
  },
  {
    name: 'Projekt Lambda',
    description: 'Automatisiertes Pflanzenbewässerungssystem mit IoT-Sensoren und Web-Dashboard.',
    image: '/images/projects/IMG_8914.jpg',
  },
  {
    name: 'Projekt Sigma',
    description: 'Kollaborative Whiteboard-Webanwendung mit Echtzeit-Synchronisation (WebRTC, Node.js).',
    image: '/images/projects/IMG_8915.jpg',
  }
];

const getRandomPosition = (side: 'left' | 'right') => {
  // Bereich für X und Y in px (angepasst an Fenstergröße und Bildschirm)
  const yMin = 5; // in Prozent
  const yMax = 45;
  const y = Math.floor(Math.random() * (yMax - yMin) + yMin); // Prozent
  const x = side === 'left'
    ? Math.floor(Math.random() * 41) // 0-40px vom linken Rand
    : Math.floor(Math.random() * 41); // 0-40px vom rechten Rand
  return { y, x };
};

const Projects: React.FC<ProjectsProps> = ({ onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [leftPos, setLeftPos] = useState(getRandomPosition('left'));
  const [rightPos, setRightPos] = useState(getRandomPosition('right'));
  const nextLeftPos = useRef(leftPos);
  const nextRightPos = useRef(rightPos);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Tastatursteuerung für Auswahl mit Animation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      nextLeftPos.current = getRandomPosition('left');
      nextRightPos.current = getRandomPosition('right');
      setVisible(false);
      setPendingIndex((selected + 1) % PROJECTS.length);
    } else if (event.key === 'ArrowUp') {
      nextLeftPos.current = getRandomPosition('left');
      nextRightPos.current = getRandomPosition('right');
      setVisible(false);
      setPendingIndex((selected - 1 + PROJECTS.length) % PROJECTS.length);
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose, selected]);

  useEffect(() => {
    setIsMounted(true);
    window.addEventListener('keydown', handleKeyDown);
    // Fenster beim ersten Öffnen nach 0.5s einblenden
    const initialTimeout = setTimeout(() => setVisible(true), 500);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(initialTimeout);
    };
  }, [handleKeyDown]);

  // Animation & neue Positionen bei Projektwechsel
  useEffect(() => {
    if (pendingIndex !== null && !visible) {
      const timeout = setTimeout(() => {
        setSelected(pendingIndex);
        setLeftPos(nextLeftPos.current);
        setRightPos(nextRightPos.current);
        setTimeout(() => {
          setVisible(true);
          setPendingIndex(null);
        }, 500); // 0.5 Sekunden warten nach Positionswechsel
      }, 180); // Ausblend-Animation
      return () => clearTimeout(timeout);
    }
  }, [pendingIndex, visible]);

  // Scrollt das ausgewählte Projekt in die Mitte
  useEffect(() => {
    if (projectRefs.current[selected]) {
      const blockType = (selected >= PROJECTS.length - 2) ? 'nearest' : 'center';
      projectRefs.current[selected]?.scrollIntoView({ behavior: 'smooth', block: blockType });
    }
  }, [selected]);

  const selectedProject = PROJECTS[selected];

  return (
    <div className="fixed inset-0 z-30">
      {/* Linkes Bild im Windows XP Explorer Stil */}
      <div
        className="hidden md:block absolute"
        style={{
          left: `${leftPos.x}px`,
          top: `calc(${leftPos.y}% - 0px)`,
          zIndex: 120,
          transition: 'left 0.2s, top 0.2s',
        }}
      >
        <div className={`xp-explorer-window w-[340px] flex flex-col items-stretch bg-[#d6cfc2] shadow-xl border border-[#b4b4b4] relative overflow-hidden transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}> 
          {/* CRT Effekt Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="crt-window-scanline" />
            <div className="crt-window-vignette" />
          </div>
          {/* Titelleiste */}
          <div className="flex items-center h-[28px] px-2 bg-gradient-to-b from-[#d6d3cb] to-[#b0aca3] border-b border-[#b4b4b4]">
            <span className="mr-2"><svg width="18" height="18" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" fill="#fff" stroke="#888" strokeWidth="1.5"/><rect x="7" y="11" width="2" height="2" fill="#3a6ea5"/><rect x="11" y="11" width="2" height="2" fill="#3a6ea5"/><rect x="15" y="11" width="2" height="2" fill="#3a6ea5"/></svg></span>
            <span className="text-white font-bold text-[15px] drop-shadow-sm select-none">My Computer</span>
            <span className="ml-auto w-6 h-6 flex items-center justify-center bg-[#b0b0b0] border border-[#6b6b6b] text-[#222] font-bold text-lg cursor-default select-none xp-x-btn">×</span>
          </div>
          {/* Menüleiste */}
          <div className="flex items-center h-[22px] px-2 text-[13px] bg-[#f4f4f4] border-b border-[#b4b4b4] text-[#222] font-sans select-none">
            <span className="mr-4 font-bold">File</span>
            <span className="mr-4">Edit</span>
            <span className="mr-4">View</span>
            <span className="mr-4">Favorites</span>
            <span>Tools</span>
          </div>
          {/* Symbolleiste */}
          <div className="flex items-center h-[28px] px-2 bg-[#f4f4f4] border-b border-[#b4b4b4] gap-2 select-none">
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">⬅️</span></span>
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">➡️</span></span>
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">🔄</span></span>
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">🗂️</span></span>
            <span className="ml-2 text-[13px] text-[#222]">|</span>
            <span className="ml-2 text-[13px] text-[#222]">My Computer</span>
          </div>
          {/* Adressleiste */}
          <div className="flex items-center h-[28px] px-2 bg-[#f4f4f4] border-b border-[#b4b4b4] gap-2 select-none">
            <span className="text-[13px] text-[#222]">Address</span>
            <span className="w-5 h-5 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" fill="#fff" stroke="#888" strokeWidth="1.5"/></svg></span>
            <span className="flex-1 h-6 bg-white border border-[#b4b4b4] px-2 text-[13px] flex items-center">C:\Projects\{selectedProject.name}</span>
          </div>
          {/* Hauptbereich mit Bild */}
          <div className="flex-1 w-full flex items-center justify-center bg-white p-0">
            <div className="w-full h-[260px] flex items-center justify-center overflow-hidden relative crt-image">
              <div className="crt-image-screen w-full h-full relative overflow-hidden">
                <div className="crt-image-scanline" />
                <Image src={selectedProject.image} alt={selectedProject.name + ' links'} fill style={{objectFit: 'cover', zIndex: 1, imageRendering: 'pixelated'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Rechtes Bild im Windows XP Explorer Stil */}
      <div
        className="hidden md:block absolute"
        style={{
          right: `${rightPos.x}px`,
          top: `calc(${rightPos.y}% - 0px)`,
          zIndex: 120,
          transition: 'right 0.2s, top 0.2s',
        }}
      >
        <div className={`xp-explorer-window w-[340px] flex flex-col items-stretch bg-[#d6cfc2] shadow-xl border border-[#b4b4b4] relative overflow-hidden transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}> 
          {/* CRT Effekt Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="crt-window-scanline" />
            <div className="crt-window-vignette" />
          </div>
          {/* Titelleiste */}
          <div className="flex items-center h-[28px] px-2 bg-gradient-to-b from-[#d6d3cb] to-[#b0aca3] border-b border-[#b4b4b4]">
            <span className="mr-2"><svg width="18" height="18" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" fill="#fff" stroke="#888" strokeWidth="1.5"/><rect x="7" y="11" width="2" height="2" fill="#3a6ea5"/><rect x="11" y="11" width="2" height="2" fill="#3a6ea5"/><rect x="15" y="11" width="2" height="2" fill="#3a6ea5"/></svg></span>
            <span className="text-white font-bold text-[15px] drop-shadow-sm select-none">My Computer</span>
            <span className="ml-auto w-6 h-6 flex items-center justify-center bg-[#b0b0b0] border border-[#6b6b6b] text-[#222] font-bold text-lg cursor-default select-none xp-x-btn">×</span>
          </div>
          {/* Menüleiste */}
          <div className="flex items-center h-[22px] px-2 text-[13px] bg-[#f4f4f4] border-b border-[#b4b4b4] text-[#222] font-sans select-none">
            <span className="mr-4 font-bold">File</span>
            <span className="mr-4">Edit</span>
            <span className="mr-4">View</span>
            <span className="mr-4">Favorites</span>
            <span>Tools</span>
          </div>
          {/* Symbolleiste */}
          <div className="flex items-center h-[28px] px-2 bg-[#f4f4f4] border-b border-[#b4b4b4] gap-2 select-none">
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">⬅️</span></span>
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">➡️</span></span>
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">🔄</span></span>
            <span className="w-7 h-7 flex items-center justify-center border border-[#b4b4b4] bg-white"><span className="text-lg">🗂️</span></span>
            <span className="ml-2 text-[13px] text-[#222]">|</span>
            <span className="ml-2 text-[13px] text-[#222]">My Computer</span>
          </div>
          {/* Adressleiste */}
          <div className="flex items-center h-[28px] px-2 bg-[#f4f4f4] border-b border-[#b4b4b4] gap-2 select-none">
            <span className="text-[13px] text-[#222]">Address</span>
            <span className="w-5 h-5 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" fill="#fff" stroke="#888" strokeWidth="1.5"/></svg></span>
            <span className="flex-1 h-6 bg-white border border-[#b4b4b4] px-2 text-[13px] flex items-center">C:\Projects\{selectedProject.name}</span>
          </div>
          {/* Hauptbereich mit Bild */}
          <div className="flex-1 w-full flex items-center justify-center bg-white p-0">
            <div className="w-full h-[260px] flex items-center justify-center overflow-hidden relative crt-image">
              <div className="crt-image-screen w-full h-full relative overflow-hidden">
                <div className="crt-image-scanline" />
                <Image src={selectedProject.image} alt={selectedProject.name + ' rechts'} fill style={{objectFit: 'cover', zIndex: 1, imageRendering: 'pixelated'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hintergrundbild */}
      <div className="fixed inset-0" style={{
        transition: 'all 0.5s ease-in-out'
      }}>
        <Image
          src="/images/COMP.jpg"
          alt="Computer Hintergrund"
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'top',
            transform: 'scale(1.2)',
            transformOrigin: 'top',
            transition: isMounted ? 'transform 0.8s ease-in-out, filter 0.5s ease-in-out' : 'none',
            filter: 'none',
          }}
          priority
        />
      </div>
      {/* CRT Monitor Frame */}
      <div className={`monitor-frame bg-black/80 backdrop-blur-sm w-[90%] max-w-[800px] crt-active`} style={{ animation: 'none', zIndex: 100 }}>
        <div className="vertical-scan" />
        <div className="crt-screen w-full h-[52vh] min-h-[170px] max-h-[320px] relative flex flex-col text-[#4af626]">
          <div className="scanline" />
          <div className="absolute inset-0 pointer-events-none" />
          <div className="flex-1 w-full flex flex-col items-start justify-start gap-4 overflow-auto">
            {PROJECTS.map((project, idx) => (
              <div
                key={project.name}
                className="w-full"
                ref={el => { projectRefs.current[idx] = el; }}
              >
                <h3
                  className={`text-lg mb-1 pl-2 transition-colors cursor-pointer ${selected === idx ? 'animate-blink' : 'hover:text-green-300'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (idx !== selected && pendingIndex === null) {
                      nextLeftPos.current = getRandomPosition('left');
                      nextRightPos.current = getRandomPosition('right');
                      setVisible(false);
                      setPendingIndex(idx);
                    }
                  }}
                >
                  {selected === idx ? '> ' : '  '}{project.name}
                </h3>
                {selected === idx && (
                  <p className="text-sm pl-6">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <style jsx global>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1s step-end infinite;
          }
          .crt-image {
            background: black;
            border-radius: 6px;
            position: relative;
          }
          .crt-image-screen {
            background: black;
            border-radius: 6px;
            overflow: hidden;
            position: relative;
          }
          .crt-image-scanline {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0),
              rgba(0,0,0,0) 0.2vh,
              rgba(0,0,0,0.12) 0.2vh,
              rgba(0,0,0,0.12) 0.4vh
            );
            opacity: 0.18;
            pointer-events: none;
            z-index: 2;
          }
          .crt-image-screen::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 6px;
            background: radial-gradient(
              circle at center,
              transparent 60%,
              rgba(0,0,0,0.0) 75%,
              rgba(0,0,0,0.7) 100%
            );
            pointer-events: none;
            z-index: 10;
          }
          .crt-window-scanline {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0),
              rgba(0,0,0,0) 0.2vh,
              rgba(0,0,0,0.10) 0.2vh,
              rgba(0,0,0,0.10) 0.4vh
            );
            opacity: 0.18;
            pointer-events: none;
            z-index: 2;
          }
          .crt-window-vignette {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
              circle at center,
              transparent 60%,
              rgba(0,0,0,0.0) 75%,
              rgba(0,0,0,0.35) 100%
            );
            pointer-events: none;
            z-index: 10;
          }
          .xp-x-btn {
            border-radius: 0 !important;
            background: #b0b0b0 !important;
            color: #222 !important;
            border: 1.5px solid #6b6b6b !important;
            box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #888;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Projects; 