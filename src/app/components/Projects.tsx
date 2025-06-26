import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProjectsProps {
  onClose: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Verzögere den Zoom-Start um einen Frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsZoomed(true);
      });
    });
  }, []);

  return (
    <div className="fixed inset-0 z-30">
      {/* Hintergrundbild */}
      <div className="fixed inset-0" style={{
        transition: 'all 0.5s ease-in-out'
      }}>
        <Image
          src="/images/COMP.jpg"
          alt="Computer Hintergrund"
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center top',
            transform: isZoomed ? 'scale(5)' : 'scale(1.2)',
            transformOrigin: 'center 20%',
            transition: isMounted ? 'transform 0.8s ease-in-out, filter 0.5s ease-in-out' : 'none',
            filter: isZoomed ? 'brightness(0.3)' : 'none',
          }}
          priority
        />
      </div>

      {/* Pink Monitor Frame */}
      <div className="pink-monitor-frame" style={{
        animation: isMounted ? 'zoomToFullscreen 0.5s ease-in-out forwards' : 'none'
      }}>
        <div className="pink-screen">
          <div className="mb-4">
            <p className="text-sm mb-2">ESC - ZURÜCK ZUM HAUPTMENÜ</p>
          </div>
          <h2 className="text-xl mb-6">{'>'} PROJEKTE_</h2>
          <div className="space-y-[4vh]">
            <div className="project-item">
              <h3 className="text-lg mb-2">{'>'} Projekt Alpha</h3>
              <p className="text-pink-300/80 text-sm pl-4">
                Eine fortschrittliche webbasierte KI-Anwendung zur Datenanalyse und Vorhersage.
                Entwickelt mit React, Python und TensorFlow.
              </p>
            </div>
            <div className="project-item">
              <h3 className="text-lg mb-2">{'>'} Projekt Beta</h3>
              <p className="text-pink-300/80 text-sm pl-4">
                Microservices-Architektur für hochskalierbare Cloud-Anwendungen.
                Implementiert mit Docker, Kubernetes und Node.js.
              </p>
            </div>
            <div className="project-item">
              <h3 className="text-lg mb-2">{'>'} Projekt Gamma</h3>
              <p className="text-pink-300/80 text-sm pl-4">
                Cross-Platform Mobile App mit React Native.
                Features: Offline-Modus, Push-Benachrichtigungen, Real-time Updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects; 