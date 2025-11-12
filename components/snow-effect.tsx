"use client";

import React, { useMemo } from "react";

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
}

const SnowEffect: React.FC = () => {
  // Generate snowflakes only once on mount to prevent re-renders
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (%)
      animationDuration: 5 + Math.random() * 10, // 5-15 seconds
      animationDelay: Math.random() * 5, // 0-5 seconds delay
      size: 2 + Math.random() * 4, // 2-6px
      opacity: 0.2 + Math.random() * 0.4, // 0.2-0.6 opacity
    }));
  }, []); // Empty dependency array - only runs once

  return (
    <div className='pointer-events-none fixed inset-0 z-50 overflow-hidden'>
      {snowflakes.map((flake) => {
        // Bigger snowflakes (>4px) get the fancy center + border treatment
        const isBigFlake = flake.size > 4;

        return (
          <div
            key={flake.id}
            className={`absolute rounded-full animate-snowfall ${
              isBigFlake ? "" : "bg-gray-300"
            }`}
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: `${flake.animationDuration}s`,
              animationDelay: `${flake.animationDelay}s`,
              top: `-${flake.size}px`,
              // Custom gray-350 for bigger flakes (between gray-300 and gray-400)
              backgroundColor: isBigFlake ? "#b7bcc5" : undefined,
              // Add a thick gray-300 border for bigger flakes
              ...(isBigFlake && {
                boxShadow: "0 0 0 2px rgba(209, 213, 219, 0.8)",
              }),
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(25vh) translateX(10px) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(10px) rotate(270deg);
          }
          100% {
            transform: translateY(100vh) translateX(0) rotate(360deg);
          }
        }

        .animate-snowfall {
          animation-name: snowfall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default SnowEffect;
