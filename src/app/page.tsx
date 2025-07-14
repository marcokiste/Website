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
  const [showProjectsLoading, setShowProjectsLoading] = useState(false);
  const [showPauseScreen, setShowPauseScreen] = useState(false);
  // Welcome-Phasen: 'none' (Start), 'welcome' (WELCOME...), 'pause' (leer), 'bootup' (Bootup-Animation)
  const [welcomePhase, setWelcomePhase] = useState<'none' | 'welcome' | 'pause' | 'bootup'>('none');
  
  const fullText = `








              --- SCROLL DOWN ---







NAME                           - MARC KISTERS -
STATUS                       - STUDENT AT FAU -

SKILLS
-----------------------------------------------
[MS-OFFICE]                      ████████░░ 80%
[FEM]                            █████░░░░░ 50%
[CAD]                            █████████░ 90%
[CODING]                         ████░░░░░░ 40%
[CREATIVITY]                     █████████░ 90%
[DEXTERITY]                      █████████░ 90%



              --- ABOUT ME ---

  "I'm a 24 year old, studying mechanical Engineering who finds peace in the rhythm of surfing, making Music and doing crafts. My creativity comes to life when I'm building and developing things—from converting my camper, woodworking, writing code, or experimenting with 3D printing. 

  I have a strong visual and spatial imagination, which helps me turn ideas into reality, especially when it comes to construction and technical problem-solving. Whether on a board or at the workbench, I'm always in motion—creating, exploring, and pushing boundaries!"




          <PRESS ME TO SEE PROJECTS>




CONTACT DETAILS
-----------------------------------------------
EMAIL               MARC.KISTERS.STUD@GMAIL.COM
PHONE NUMBER                    +49 178 2047592
INSTAGRAM                          MARC.KISTERS



`;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !showContent && !isInitializing && welcomePhase === 'none') {
         setWelcomePhase('pause');
         playBootupSequence();
         setTimeout(() => setWelcomePhase('welcome'), 1000); // 1s Blackscreen
         setTimeout(() => setWelcomePhase('pause'), 4000); // 3s Welcome
         setTimeout(() => {
           setWelcomePhase('bootup');
           setIsInitializing(true);
           startInitialization();
         }, 5000);
      }
      if (event.key === 'Escape' && showProjects) {
        setShowProjects(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showContent, isInitializing, showProjects, welcomePhase]);

  const startInitialization = () => {
    let progress = 0;
    const loadingSteps = [
      "INITIALIZING SYSTEM...",
      "LOADING CORE MODULES...",
      "CALIBRATING INTERFACES...",
      "PROFILE <MARC KISTERS> IS LOADING...",
    ];
    
    const interval = setInterval(() => {
      progress += 2;
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
      setText(fullText);
    }
  }, [showContent, fullText]);

  const renderTextWithLinks = (textToRender: string) => {
    const parts = textToRender.split(/(<PRESS ME TO SEE PROJECTS>|\(FAU\))/g);
    return parts.map((part, index) => {
      if (part === '(FAU)') {
        return (
          <span
            key={index}
            className="underline hover:text-green-300 animate-blink cursor-pointer"
            onClick={() => window.open('https://www.fau.de', '_blank', 'noopener,noreferrer')}
          >
            (FAU)
          </span>
        );
      }
      if (part === '<PRESS ME TO SEE PROJECTS>') {
        return (
          <span
            key={index}
            className="cursor-pointer hover:text-green-300 animate-blink border-2 border-[#4af626] rounded-md px-2 py-1 hover:border-green-300"
            onClick={() => {
              playClickSound();
              setShowProjectsLoading(true);
              setTimeout(() => {
                setShowProjectsLoading(false);
                setShowProjects(true);
              }, 500);
            }}
          >
            &lt;PRESS ME TO SEE PROJECTS&gt;
          </span>
        );
      }
      return part;
    });
  };

  const getLoadingStep = (progress: number) => {
    if (progress < 35) return "INITIALIZING SYSTEM...";
    if (progress < 45) return "STARTING SUBSYSTEMS...";
    if (progress < 65) return "CALIBRATING INTERFACES...";
    return "LOADING PROFILE...";
  };

  const renderLoadingBar = (progress: number) => {
    const width = progress;
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

  // Audio-Objekte für Boot-Sounds
  let startup0Audio: HTMLAudioElement | null = null;
  let loopAudio: HTMLAudioElement | null = null;

  function playBootupSequence() {
    // Stoppe evtl. laufende Audios
    if (startup0Audio) { startup0Audio.pause(); startup0Audio.currentTime = 0; }
    if (loopAudio) { loopAudio.pause(); loopAudio.currentTime = 0; }
    startup0Audio = new window.Audio('/soundeffects/Startup0.mp3');
    startup0Audio.volume = 0.25;
    startup0Audio.play();
    // Überlappung: Starte Loop 0.25s vor Ende von Startup0
    let startedLoop = false;
    const tryStartLoop = () => {
      if (!startup0Audio) return;
      if (!startedLoop && startup0Audio.duration && startup0Audio.currentTime > 0 && (startup0Audio.duration - startup0Audio.currentTime) < 0.26) {
        startedLoop = true;
        playLoop();
      }
      if (!startedLoop) requestAnimationFrame(tryStartLoop);
    };
    startup0Audio.onplay = () => requestAnimationFrame(tryStartLoop);
  }

  function playLoop() {
    if (loopAudio) { loopAudio.pause(); loopAudio.currentTime = 0; }
    let thisLoop = new window.Audio('/soundeffects/Startuploop.mp3');
    thisLoop.volume = 0.25;
    thisLoop.play();
    loopAudio = thisLoop;
    let startedNext = false;
    const tryStartNext = () => {
      if (!thisLoop) return;
      if (!startedNext && thisLoop.duration && thisLoop.currentTime > 0 && (thisLoop.duration - thisLoop.currentTime) < 0.26) {
        startedNext = true;
        // Starte nächste Instanz und stoppe diese nach Überlappung
        playLoop();
        setTimeout(() => {
          thisLoop.pause();
          thisLoop.currentTime = 0;
        }, 300); // 0.3s Überlappung
      }
      if (!startedNext) requestAnimationFrame(tryStartNext);
    };
    thisLoop.onplay = () => requestAnimationFrame(tryStartNext);
  }

  // Klicksound-Funktion für UI-Feedback
  function playClickSound() {
    const audio = new window.Audio('/soundeffects/mouseclick.mp3');
    audio.volume = 0.175;
    audio.currentTime = 0;
    audio.play();
  }

  // Für animiertes WELCOME
  const [welcomeText, setWelcomeText] = useState('');
  useEffect(() => {
    if (welcomePhase === 'welcome') {
      setWelcomeText('');
      const full = 'WELCOME';
      let i = 0;
      const interval = setInterval(() => {
        setWelcomeText(full.slice(0, i + 1));
        i++;
        if (i >= full.length) clearInterval(interval);
      }, 180);
      return () => clearInterval(interval);
    }
  }, [welcomePhase]);

  return (
    <div className="min-h-screen w-screen bg-black relative">
      {/* Mobile Blocker */}
      <div className="md:hidden fixed inset-0 bg-black z-50 flex items-center justify-center p-8">
        <p className="font-mono text-center text-[#4af626] text-lg animate-pulse">
          INCOMPATIBLE HARDWARE.
          <br /><br />
          PLEASE OPEN WEBSITE ON DESKTOP.
        </p>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block">
        {/* Hintergrundbild */}
        <div className="fixed inset-0">
          {/* COMP2.png darüber */}
          <Image
            src="/images/COMP.jpg"
            alt="Computer Hintergrund"
            fill
            style={{
              objectFit: 'contain',
              objectPosition: 'top',
              transform: 'scale(1.2)',
              transformOrigin: 'top',
              zIndex: 1
            }}
            priority
          />
        </div>

        {/* Chalk Hinweis und Pfeil - nur beim Bootscreen */}
        {(!showPauseScreen) && (
          <>
            {/* press_enter.jpg wieder sichtbar */}
            <div className="fixed left-0 top-1/3 z-30 flex flex-col items-start pl-8 select-none pointer-events-none" style={{transform: 'translateY(-33%)'}}>
              <img src="/images/press_enter.jpg" alt="Press Enter to start PC" style={{maxWidth: '340px', width: '48vw', height: 'auto'}} />
            </div>
          </>
        )}

        {/* HI.jpeg oben rechts über dem CRT-Screen */}
        <img
          src="/images/HI.jpeg"
          alt="HI"
          className="fixed right-32 top-8 z-0"
          style={{width: '120px', height: 'auto'}}
        />

        {/* Hauptcontainer */}
        <div className="min-h-screen w-screen flex items-center justify-center p-8 relative z-10">
          <div className={`monitor-frame bg-black/80 backdrop-blur-sm w-[90%] max-w-[800px] ${showContent || isInitializing ? 'crt-active' : ''}`}>
            {(showContent || isInitializing) && <div className="vertical-scan" />}
            <div className="crt-screen w-full h-[60vh] min-h-[300px] max-h-[600px] relative overflow-hidden">
              {/* Scanline Effekt */}
              <div className="scanline" />
              
              {/* CRT Glow */}
              <div className="absolute inset-0 pointer-events-none" />
              
              {showProjectsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="font-mono text-[#4af626]">
                    <div className="mb-4">LOADING PROJECTS...</div>
                    <div className="flex items-center gap-2">
                      <div className="w-[200px] h-6 border-2 border-[#4af626] relative overflow-hidden">
                        <div className="h-full bg-[#4af626]/30 animate-xpbar" style={{ width: '0%' }} />
                      </div>
                    </div>
                    <style jsx>{`
                      @keyframes xpbar {
                        0% { width: 0%; }
                        100% { width: 100%; }
                      }
                      .animate-xpbar {
                        animation: xpbar 0.5s linear forwards;
                      }
                    `}</style>
                  </div>
                </div>
              ) : !showContent && !isInitializing && !showPauseScreen ? (
                welcomePhase === 'welcome' ? (
                  <div className="h-full w-full flex items-center justify-center bg-black">
                    <span className="text-[#4af626] font-mono text-2xl">{welcomeText}</span>
                  </div>
                ) : (
                  <div className="h-full w-full bg-black" />
                )
              ) : showPauseScreen ? (
                <div className="h-full w-full bg-black" />
              ) : isInitializing ? (
                <div className="h-full flex items-center justify-center">
                  {renderLoadingBar(loadingProgress)}
                </div>
              ) : (
                <div className="h-full overflow-y-auto p-4 crt-text-wrapper scrollbar-hide">
                  <pre className="text-sm md:text-base whitespace-pre-wrap font-mono text-[#4af626]">
                    {renderTextWithLinks(text)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {showProjects && <Projects onClose={() => setShowProjects(false)} />}
      </div>
    </div>
  );
} 