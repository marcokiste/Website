'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Projects from './components/Projects';

export default function Home() {
  const [text, setText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showProjects, setShowProjects] = useState(false);
  
  const fullText = `
NAME: Max Mustermann
ROLLE: Full-Stack Entwickler
STATUS: Verfügbar für Projekte

TECHNISCHE FÄHIGKEITEN:
----------------------
[JavaScript] ████████░░ 80%
[React.js]   ███████░░░ 70%
[Node.js]    ████████░░ 80%
[Python]     ██████░░░░ 60%
[Docker]     ███████░░░ 70%

PROJEKTE:
--------
1. Projekt Alpha - Webbasierte KI-Anwendung
2. Projekt Beta - Cloud-Native Microservices
3. Projekt Gamma - React Native Mobile App

> SYSTEM BEREIT...
`;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !showContent && !isInitializing) {
        setIsInitializing(true);
        startInitialization();
      }
      if (event.key.toLowerCase() === 'p' && showContent) {
        setShowProjects(true);
      }
      if (event.key === 'Escape' && showProjects) {
        setShowProjects(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showContent, isInitializing, showProjects]);

  const startInitialization = () => {
    let progress = 0;
    const loadingSteps = [
      "INITIALISIERE SYSTEM...",
      "LADE KERNMODULE...",
      "STARTE SUBSYSTEME...",
      "KALIBRIERE SCHNITTSTELLEN...",
      "AKTIVIERE BENUTZEROBERFLÄCHE..."
    ];
    
    const interval = setInterval(() => {
      progress += 1;
      setLoadingProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsInitializing(false);
          setShowContent(true);
        }, 500);
      }
    }, 30);
  };

  useEffect(() => {
    if (showContent) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [showContent]);

  const getLoadingStep = (progress: number) => {
    if (progress < 40) return "INITIALISIERE SYSTEM...";
    if (progress < 65) return "STARTE SUBSYSTEME...";
    if (progress < 80) return "KALIBRIERE SCHNITTSTELLEN...";
    return "AKTIVIERE BENUTZEROBERFLÄCHE...";
  };

  const renderLoadingBar = (progress: number) => {
    const width = Math.floor(progress / 2);
    return (
      <div className="font-mono text-[#4af626]">
        <div className="mb-4">{getLoadingStep(progress)}</div>
        <div className="flex items-center gap-2">
          <div className="w-[200px] h-6 border-2 border-[#4af626] relative overflow-hidden">
            <div 
              className="h-full bg-[#4af626]/30 transition-all duration-100"
              style={{ width: `${width}%` }}
            />
          </div>
          <span>{progress}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen bg-black relative">
      {/* Hintergrundbild */}
      <div className="fixed inset-0">
        <Image
          src="/images/COMP.jpg"
          alt="Computer Hintergrund"
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'top',
            transform: 'scale(1.2)',
            transformOrigin: 'top'
          }}
          priority
        />
      </div>

      {/* Hauptcontainer */}
      <div className="min-h-screen w-screen flex items-center justify-center p-8 relative z-10">
        <div className={`monitor-frame bg-black/80 backdrop-blur-sm w-[90%] max-w-[800px] ${showContent || isInitializing ? 'crt-active' : ''}`}>
          {(showContent || isInitializing) && <div className="vertical-scan" />}
          <div className="crt-screen w-full h-[60vh] min-h-[300px] max-h-[600px] relative overflow-hidden">
            {/* Scanline Effekt */}
            <div className="scanline" />
            
            {/* CRT Glow */}
            <div className="absolute inset-0 pointer-events-none" />
            
            {!showContent && !isInitializing ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[#4af626] font-mono text-xl terminal-text animate-[blink_1s_step-end_infinite]">
                  TO REBOOT PRESS ENTER...
                </p>
              </div>
            ) : isInitializing ? (
              <div className="h-full flex items-center justify-center">
                {renderLoadingBar(loadingProgress)}
              </div>
            ) : (
              <div className="h-full overflow-auto p-[5%]">
                <pre className="font-mono text-[#4af626] whitespace-pre-wrap terminal-text text-sm">
                  {text}
                  <span className="inline-block w-2 h-4 bg-[#4af626] animate-[blink_1s_step-end_infinite]" />
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projekte Overlay */}
      {showProjects && <Projects onClose={() => setShowProjects(false)} />}
    </div>
  );
} 