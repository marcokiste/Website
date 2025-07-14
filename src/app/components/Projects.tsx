import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ProjectsProps {
  onClose: () => void;
}

interface Project {
  name: string;
  description: string;
  image: string;
  images: string[];
}

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

// Hilfsfunktion: Generiere nicht-überlappende Positionen im gesamten Viewport, aber max. 20px Überlappung mit CRT
function generateNonOverlappingPositionsViewport(count: number, minDist = 320, winW = 1200, winH = 800) {
  const positions: {x: number, y: number}[] = [];
  let tries = 0;
  // CRT-Monitor-Position und -Größe (hartkodiert wie im Layout)
  const crt = {
    left: winW * 0.05, // 5% links
    top: winH * 0.18, // ca. 18% von oben
    width: Math.min(winW * 0.9, 800),
    height: Math.min(winH * 0.52, 320),
  };
  while (positions.length < count && tries < 5000) {
    // Fenstergröße: 340x320px
    const x = Math.floor(Math.random() * (winW - 340));
    const y = Math.floor(Math.random() * (winH - 320));
    // Überlappung mit CRT prüfen
    const margin = 20;
    const fenster = {left: x, top: y, right: x+340, bottom: y+320};
    const crtWithMargin = {
      left: crt.left - margin,
      top: crt.top - margin,
      right: crt.left + crt.width + margin,
      bottom: crt.top + crt.height + margin,
    };
    // Erlaube max. margin-Überlappung
    const overlapX = Math.max(0, Math.min(fenster.right, crtWithMargin.right) - Math.max(fenster.left, crtWithMargin.left));
    const overlapY = Math.max(0, Math.min(fenster.bottom, crtWithMargin.bottom) - Math.max(fenster.top, crtWithMargin.top));
    const overlapArea = overlapX * overlapY;
    // Wenn mehr als margin-Überlappung, verwerfen
    if (overlapArea > 0 && (overlapX > 340-margin*2 || overlapY > 320-margin*2)) {
      tries++;
      continue;
    }
    // Prüfe Abstand der Mittelpunkte zu anderen Fenstern
    const fensterCenter = {cx: x+170, cy: y+160};
    const tooClose = positions.some(p => {
      const otherCenter = {cx: p.x+170, cy: (p.y/100)*winH+160};
      return Math.sqrt((fensterCenter.cx-otherCenter.cx)**2 + (fensterCenter.cy-otherCenter.cy)**2) < minDist;
    });
    if (!tooClose) {
      positions.push({x, y: (y/winH)*100}); // y als Prozent für Kompatibilität
    }
    tries++;
  }
  // Falls nicht genug gefunden, fülle auf
  while (positions.length < count) {
    const x = Math.floor(Math.random() * (winW - 340));
    const y = Math.floor(Math.random() * (winH - 320));
    positions.push({x, y: (y/winH)*100});
  }
  return positions;
}

function generatePositionsAroundCRT(count: number, minDist = 320, winW = 1200, winH = 800) {
  const positions: {x: number, y: number}[] = [];
  let tries = 0;
  // CRT-Monitor-Position und -Größe (wie im Layout)
  const crt = {
    left: winW * 0.05,
    top: winH * 0.18,
    width: Math.min(winW * 0.9, 800),
    height: Math.min(winH * 0.52, 320),
  };
  const margin = 20;
  const fensterW = 340, fensterH = 320;
  // Bereiche berechnen, die groß genug für ein Fenster sind
  const areas = [
    // Oben
    { xMin: 0, xMax: winW-fensterW, yMin: 0, yMax: crt.top - fensterH + margin },
    // Unten
    { xMin: 0, xMax: winW-fensterW, yMin: crt.top + crt.height - margin, yMax: winH-fensterH },
    // Links
    { xMin: 0, xMax: crt.left - fensterW + margin, yMin: crt.top - margin, yMax: crt.top + crt.height - fensterH + margin },
    // Rechts
    { xMin: crt.left + crt.width - margin, xMax: winW-fensterW, yMin: crt.top - margin, yMax: crt.top + crt.height - fensterH + margin },
  ].filter(a => a.xMax > a.xMin && a.yMax > a.yMin);
  while (positions.length < count && tries < 5000) {
    if (areas.length === 0) break;
    // Wähle zufällig einen Bereich
    const area = areas[Math.floor(Math.random()*areas.length)];
    const x = Math.floor(Math.random() * (area.xMax - area.xMin + 1) + area.xMin);
    const y = Math.floor(Math.random() * (area.yMax - area.yMin + 1) + area.yMin);
    // Prüfe Abstand der Mittelpunkte zu anderen Fenstern
    const fensterCenter = {cx: x+fensterW/2, cy: y+fensterH/2};
    const tooClose = positions.some(p => {
      const otherCenter = {cx: p.x+fensterW/2, cy: (p.y/100)*winH+fensterH/2};
      return Math.sqrt((fensterCenter.cx-otherCenter.cx)**2 + (fensterCenter.cy-otherCenter.cy)**2) < minDist;
    });
    if (!tooClose) {
      positions.push({x, y: (y/winH)*100});
    }
    tries++;
  }
  // Falls nicht genug gefunden, fülle auf (zur Not irgendwo oben)
  while (positions.length < count) {
    positions.push({x: 10 + positions.length*30, y: 0});
  }
  return positions;
}

// Hilfsfunktion: Bildgröße anhand Seitenverhältnis berechnen
function getWindowSizeForImage(aspect: number, maxW = 340, maxH = 320, minW = 180, minH = 120) {
  let w = maxW, h = Math.round(maxW / aspect);
  if (h > maxH) {
    h = maxH;
    w = Math.round(maxH * aspect);
  }
  if (w < minW) { w = minW; h = Math.round(w / aspect); }
  if (h < minH) { h = minH; w = Math.round(h * aspect); }
  return { w, h };
}

// Klicksound-Funktion
function playClickSound() {
  const audio = new window.Audio('/soundeffects/mouseclick.mp3');
  audio.volume = 0.175;
  audio.currentTime = 0;
  audio.play();
}

const Projects: React.FC<ProjectsProps> = ({ onClose }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  // Positionen für alle Fenster (ein Fenster pro Bild)
  const [windowPositions, setWindowPositions] = useState<{x: number, y: number}[]>([]);
  const windowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dragging, setDragging] = useState<(boolean)[]>([]);
  const [dragOffsets, setDragOffsets] = useState<{x: number, y: number}[]>([]);
  const [leftPos, setLeftPos] = useState(getRandomPosition('left'));
  const [rightPos, setRightPos] = useState(getRandomPosition('right'));
  const nextLeftPos = useRef(leftPos);
  const nextRightPos = useRef(rightPos);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Sichtbarkeit der Fenster
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  // Drag-States für beide Fenster
  const [draggingLeft, setDraggingLeft] = useState(false);
  const [draggingRight, setDraggingRight] = useState(false);
  const [dragOffsetLeft, setDragOffsetLeft] = useState({ x: 0, y: 0 });
  const [dragOffsetRight, setDragOffsetRight] = useState({ x: 0, y: 0 });

  // Maus-Event-Handler für Drag & Drop
  const leftWindowRef = useRef<HTMLDivElement>(null);
  const rightWindowRef = useRef<HTMLDivElement>(null);

  const [imageSizes, setImageSizes] = useState<{w: number, h: number}[]>([]);

  const [activeWindow, setActiveWindow] = useState<number | null>(null);

  // Sichtbarkeit einzelner Fenster für zeitversetztes Öffnen
  const [windowVisible, setWindowVisible] = useState<boolean[]>([]);

  // Pop-in-Animation pro Fenster
  const [windowPopAnimating, setWindowPopAnimating] = useState<boolean[]>([]);

  // Lade Projekte von der API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error('Fehler beim Laden der Projekte');
        }
      } catch (error) {
        console.error('Fehler beim Laden der Projekte:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Tastatursteuerung für Auswahl mit Animation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (projects.length === 0) return;
    
    if (event.key === 'ArrowDown' && selected !== null) {
      nextLeftPos.current = getRandomPosition('left');
      nextRightPos.current = getRandomPosition('right');
      setVisible(false);
      setPendingIndex((selected + 1) % projects.length);
    } else if (event.key === 'ArrowUp' && selected !== null) {
      nextLeftPos.current = getRandomPosition('left');
      nextRightPos.current = getRandomPosition('right');
      setVisible(false);
      setPendingIndex((selected - 1 + projects.length) % projects.length);
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose, selected, projects.length]);

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

  // Setze Fenster-Positionen neu und öffne Fenster zeitversetzt, wenn Projekt gewechselt wird
  useEffect(() => {
    if (typeof window !== 'undefined' && selected !== null && projects[selected]?.images) {
      setWindowPositions(generatePositionsAroundCRT(
        projects[selected].images.length,
        320,
        window.innerWidth,
        window.innerHeight
      ));
      setDragging(projects[selected].images.map(() => false));
      setDragOffsets(projects[selected].images.map(() => ({x: 0, y: 0})));
      // Fenster erst unsichtbar, dann nacheinander sichtbar machen
      setWindowVisible(Array(projects[selected].images.length).fill(false));
      setWindowPopAnimating(Array(projects[selected].images.length).fill(false));
      setTimeout(() => {
        projects[selected].images.forEach((_, idx) => {
          setTimeout(() => {
            setWindowVisible(prev => {
              const arr = [...prev];
              arr[idx] = true;
              return arr;
            });
            setWindowPopAnimating(prev => {
              const arr = [...prev];
              arr[idx] = true;
              return arr;
            });
            setTimeout(() => {
              setWindowPopAnimating(prev => {
                const arr = [...prev];
                arr[idx] = false;
                return arr;
              });
            }, 500);
          }, idx * 300);
        });
      }, 0);
    }
  }, [selected, projects]);

  // Drag Start für ein bestimmtes Fenster
  const handleWindowDragStart = (idx: number) => (e: React.MouseEvent) => {
    if (windowRefs.current[idx]) {
      const rect = windowRefs.current[idx]!.getBoundingClientRect();
      const newDragging = [...dragging];
      newDragging[idx] = true;
      setDragging(newDragging);
      const newOffsets = [...dragOffsets];
      newOffsets[idx] = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setDragOffsets(newOffsets);
    }
  };

  // Drag Move & End für alle Fenster
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPositions = [...windowPositions];
      dragging.forEach((isDrag, idx) => {
        if (isDrag) {
          newPositions[idx] = {
            x: Math.max(0, e.clientX - dragOffsets[idx].x),
            y: Math.max(0, ((e.clientY - dragOffsets[idx].y) / window.innerHeight) * 100),
          };
        }
      });
      setWindowPositions(newPositions);
    };
    const handleMouseUp = () => {
      if (dragging.some(Boolean)) {
        setDragging(dragging.map(() => false));
      }
    };
    if (dragging.some(Boolean)) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffsets, windowPositions]);

  useEffect(() => {
    if (selected === null || !projects[selected]?.images) return;
    let isMounted = true;
    Promise.all(projects[selected].images.map(img => {
      return new Promise<{w: number, h: number}>(resolve => {
        const i = new window.Image();
        i.onload = () => {
          const aspect = i.naturalWidth / i.naturalHeight || 1;
          resolve(getWindowSizeForImage(aspect));
        };
        i.onerror = () => resolve({w: 340, h: 220});
        i.src = img;
      });
    })).then(sizes => {
      if (isMounted) setImageSizes(sizes);
    });
    return () => { isMounted = false; };
  }, [selected, projects]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black">
        <div className="font-mono text-[#4af626] text-lg">
          LOADING PROJECTS...
        </div>
      </div>
    );
  }

  const selectedProject = selected !== null ? projects[selected] : null;

  return (
    <div className="fixed inset-0 z-30">
      {/* Für jedes Bild ein XP-Fenster */}
      {selectedProject?.images?.map((img: string, idx: number) => {
        const imgSize = imageSizes[idx] || {w: 340, h: 220};
        const isActive = activeWindow === idx || dragging[idx];
        // Fenster nur anzeigen, wenn windowVisible[idx] true ist
        if (!windowVisible[idx]) return null;
        // Prüfe, ob es sich um ein Video handelt
        const isVideo = /\.(mp4|webm|ogg)$/i.test(img);
        return (
          <div
            key={img}
            ref={el => { windowRefs.current[idx] = el; }}
            className="hidden md:block absolute"
            style={{
              left: `${windowPositions[idx]?.x || 0}px`,
              top: `calc(${windowPositions[idx]?.y || 0}% - 0px)` ,
              zIndex: isActive ? 999 : 120 + idx,
              width: imgSize.w,
              height: imgSize.h + 100, // Platz für Leisten
              transition: dragging[idx] ? 'none' : 'left 0.2s, top 0.2s, width 0.2s, height 0.2s',
              cursor: dragging[idx] ? 'grabbing' : 'default',
            }}
            onMouseDown={() => setActiveWindow(idx)}
          >
            <div className={`xp-explorer-window flex flex-col items-stretch bg-[#d6cfc2] shadow-xl border border-[#b4b4b4] relative overflow-hidden ${windowPopAnimating[idx] ? 'animate-xp-pop' : windowVisible[idx] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{width: '100%', height: '100%', border: '1px solid #d6cfc2'}}>
              {/* CRT Effekt Overlay */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="crt-window-scanline" />
              </div>
              {/* Titelleiste */}
              <div
                className="flex items-center h-[28px] px-2 bg-gradient-to-b from-[#d6d3cb] to-[#b0aca3] border-b border-[#b4b4b4] cursor-move select-none"
                onMouseDown={handleWindowDragStart(idx)}
                style={{userSelect: 'none'}}>
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
                <span className="flex-1 h-6 bg-white border border-[#b4b4b4] px-2 text-[13px] flex items-center">C:\Projects\{selectedProject?.name?.split(' ')[0]}</span>
              </div>
              {/* Hauptbereich mit Bild oder Video */}
              <div className="flex-1 w-full flex items-center justify-center bg-white p-0">
                <div className="w-full h-full flex items-center justify-center overflow-hidden relative crt-image">
                  <div className="crt-image-screen w-full h-full relative overflow-hidden">
                    <div className="crt-image-scanline" />
                    {isVideo ? (
                      <video
                        src={img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ objectFit: 'cover', width: '100%', height: '100%', zIndex: 1 }}
                      />
                    ) : (
                      <Image src={img} alt={selectedProject.name + ' Bild'} fill style={{objectFit: 'cover', zIndex: 1, imageRendering: 'pixelated'}} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* CRT Monitor Frame */}
      <div className={`monitor-frame bg-black/80 backdrop-blur-sm w-[90%] max-w-[800px] crt-active`} style={{ animation: 'none', zIndex: 100 }}>
        <div className="vertical-scan" />
        <div className="crt-screen w-full h-[52vh] min-h-[170px] max-h-[320px] relative flex flex-col text-[#4af626]">
          {/* Überschrift und ESC-Hinweis innerhalb des CRT Monitors */}
          <div className="w-full flex justify-between items-center px-8 pt-3 pb-1 select-none border-b border-[#4af626] bg-black/90 z-20" style={{overflow: 'hidden', position: 'relative', marginBottom: '0.25rem'}}>
            {/* CRT Scanline Effekt für Header */}
            <div className="scanline" style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1}} />
            <span className="text-[#4af626] font-mono text-xl font-bold tracking-widest">PROJECTS_</span>
            <span
              className="text-[#4af626] font-mono text-lg cursor-pointer hover:text-green-300"
              onClick={onClose}
              style={{userSelect: 'none'}}
            >ESC&gt;</span>
          </div>
          <div className="scanline" />
          <div className="absolute inset-0 pointer-events-none" />
          <div className="flex-1 w-full flex flex-col items-start justify-start gap-4 overflow-y-scroll" style={{paddingLeft: '2rem', paddingRight: '2rem'}}>
            {projects.map((project, idx) => (
              <div
                key={project.name}
                className="w-full"
                ref={el => { projectRefs.current[idx] = el; }}
              >
                <h3
                  className={`text-lg mb-1 pl-2 pr-2 transition-colors cursor-pointer ${selected === idx ? 'animate-blink' : 'hover:text-green-300'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    playClickSound();
                    if (selected === idx) {
                      setSelected(null);
                      return;
                    }
                    if (selected !== idx && pendingIndex === null) {
                      nextLeftPos.current = getRandomPosition('left');
                      nextRightPos.current = getRandomPosition('right');
                      setVisible(false);
                      setPendingIndex(idx);
                    }
                    if (selected === null) {
                      setSelected(idx);
                    }
                  }}
                >
                  {selected === idx ? '> ' : '  '}{project.name}
                </h3>
                {selected !== null && selected === idx && (
                  <p className="text-sm pl-6 pr-4">
                    {project.description}
                  </p>
                )}
                {idx < projects.length - 1 && (
                  <div className="w-full flex justify-center">
                    <span className="text-[#4af626] opacity-25 text-xs font-mono select-none">//</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <style jsx global>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            85% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1.2s step-end infinite;
          }
          .crt-image {
            background: black;
            /* border-radius: 6px; */
            position: relative;
          }
          .crt-image-screen {
            background: black;
            /* border-radius: 6px; */
            overflow: hidden;
            position: relative;
          }
          /* Entferne Vignette nur für XP-Fenster */
          .xp-explorer-window .crt-image-screen::before {
            display: none !important;
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
          /* Grüne Scrollbar für CRT-Bereich */
          .crt-screen, .crt-screen * {
            scrollbar-width: thin;
            scrollbar-color: #39ff14 #111;
          }
          .crt-screen::-webkit-scrollbar {
            width: 10px;
            background: #111;
          }
          .crt-screen::-webkit-scrollbar-thumb {
            background: #39ff14;
            border-radius: 6px;
            border: 2px solid #111;
          }
          .crt-screen::-webkit-scrollbar-thumb:hover {
            background: #4af626;
          }
          .crt-screen::-webkit-scrollbar-track {
            background: #111;
          }
          .xp-x-btn {
            border-radius: 0 !important;
            background: #b0b0b0 !important;
            color: #222 !important;
            border: 1.5px solid #6b6b6b !important;
            box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #888;
          }
          @keyframes xp-pop {
            0% { opacity: 0; transform: scale(0.7); }
            100% { opacity: 1; transform: scale(1.0); }
          }
          .animate-xp-pop {
            animation: xp-pop 0.44s cubic-bezier(0.22, 1, 0.36, 1);
            opacity: 1;
            transform: scale(1.0);
          }
        `}</style>
      </div>
    </div>
  );
};

export default Projects; 