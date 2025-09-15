"use client";
import { useEffect, useState } from "react";

export const ThreeBackground = () => {
  const hexagons = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 15; col++) {
      hexagons.push({ row, col, id: row * 15 + col });
    }
  }
  
  const [activeHexagons, setActiveHexagons] = useState<number[]>([]);
  
  useEffect(() => {
    const animateHexagons = () => {
      const randomIndices = [];
      while (randomIndices.length < 8) {
        const randomIndex = Math.floor(Math.random() * hexagons.length);
        if (!randomIndices.includes(randomIndex)) {
          randomIndices.push(randomIndex);
        }
      }
      
      setActiveHexagons(randomIndices);
      
      setTimeout(() => {
        setActiveHexagons([]);
      }, 2000);
    };
    
    animateHexagons();
    const interval = setInterval(animateHexagons, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <div className="hexagon-container">
        <div className="hexagon-grid">
          {hexagons.map(({ row, col, id }, i) => (
            <div
              key={i}
              className={`hexagon ${activeHexagons.includes(i) ? 'pulse' : ''}`}
              style={{
                left: `${col * 7 + (row % 2) * 3.5}%`,
                top: `${row * 10}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <style jsx global>{`
        .hexagon-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }
        
        .hexagon-grid {
          position: relative;
          width: 120%;
          height: 120%;
          transform: translate(-10%, -10%);
        }
        
        .hexagon {
          position: absolute;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          opacity: 0.4;
          transform: scale(0.8) rotate(0deg);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 1px solid rgba(59, 130, 246, 0.2);
          pointer-events: auto;
          cursor: crosshair;
        }
        
        .hexagon::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: -1;
        }
        
        .hexagon:hover {
          opacity: 1;
          transform: scale(1.3) rotate(15deg);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
          box-shadow: 
            0 0 30px rgba(59, 130, 246, 0.6),
            0 0 60px rgba(147, 51, 234, 0.3),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(59, 130, 246, 0.8);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .hexagon:hover::before {
          opacity: 1;
        }
        
        .hexagon.pulse {
          animation: hexagonPulse 2s ease-in-out;
        }
        
        @keyframes hexagonPulse {
          0% {
            opacity: 0.4;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(10deg);
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4));
            box-shadow: 
              0 0 25px rgba(59, 130, 246, 0.7),
              0 0 50px rgba(147, 51, 234, 0.4);
            border: 2px solid rgba(59, 130, 246, 0.9);
          }
          100% {
            opacity: 0.4;
            transform: scale(0.8) rotate(0deg);
          }
        }
        
        @media (max-width: 768px) {
          .hexagon {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>
    </>
  );
};