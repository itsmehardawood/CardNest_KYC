'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const router = useRouter();
  const [lines, setLines] = useState([]);

  const handleGetStarted = () => {
    router.push('/document-verification');
  };

  useEffect(() => {
    const generated = [];

    // Horizontal lines
    for (let i = 0; i < 22; i++) {
      generated.push({
        type: 'h',
        top: i * 9 + 8,
        width: Math.random() * 40 + 60,
        left: Math.random() * 20,
        opacity: Math.random() * 0.2 + 0.3,
      });
    }

    // Vertical lines
    for (let i = 0; i < 14; i++) {
      generated.push({
        type: 'v',
        left: i * 10 + 10,
        height: Math.random() * 40 + 60,
        top: Math.random() * 20,
        opacity: Math.random() * 0.2 + 0.3,
      });
    }

    // Diagonal lines
    for (let i = 0; i < 12; i++) {
      generated.push({
        type: 'd',
        top: Math.random() * 160,
        left: Math.random() * 80,
        length: Math.random() * 50 + 40,
        rotate: Math.random() > 0.5 ? 35 : -35,
        opacity: Math.random() * 0.2 + 0.3,
      });
    }

    setLines(generated);
  }, []);

  return (
    <div className="flex flex-col items-center justify-around py-20 h-screen bg-slate-800">

      {/* REALISTIC FACE SHAPE */}
      <div className="relative w-40 h-56">
        {/* SVG Border outline */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 224">
          <path
            d="M 80 5 
               C 60 5, 35 8, 25 15
               C 18 20, 12 30, 10 45
               C 8 60, 8 80, 10 100
               C 12 120, 15 140, 20 155
               C 25 170, 32 185, 42 195
               C 52 205, 65 212, 80 215
               C 95 212, 108 205, 118 195
               C 128 185, 135 170, 140 155
               C 145 140, 148 120, 150 100
               C 152 80, 152 60, 150 45
               C 148 30, 142 20, 135 15
               C 125 8, 100 5, 80 5 Z"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Content area with lines */}
        <div
          className="absolute inset-1 overflow-hidden"
          style={{
            borderRadius: '45% 45% 38% 38%',
            clipPath:
              'polygon(20% 0%, 80% 0%, 95% 25%, 90% 65%, 70% 95%, 30% 95%, 10% 65%, 5% 25%)',
          }}
        >
          {lines.map((line, i) => {
          if (line.type === 'h') {
            return (
              <span
                key={i}
                className="absolute h-[1px] bg-cyan-400"
                style={{
                  top: `${line.top}px`,
                  width: `${line.width}%`,
                  left: `${line.left}%`,
                  opacity: line.opacity,
                }}
              />
            );
          }

          if (line.type === 'v') {
            return (
              <span
                key={i}
                className="absolute w-[1px] bg-cyan-400"
                style={{
                  left: `${line.left}px`,
                  height: `${line.height}%`,
                  top: `${line.top}%`,
                  opacity: line.opacity,
                }}
              />
            );
          }

          return (
            <span
              key={i}
              className="absolute h-[1px] bg-cyan-400 origin-left"
              style={{
                top: `${line.top}px`,
                left: `${line.left}px`,
                width: `${line.length}px`,
                transform: `rotate(${line.rotate}deg)`,
                opacity: line.opacity,
              }}
            />
          );
        })}
        </div>
      </div>

      {/* TEXT */}
      <h1 className="text-white text-5xl mt-4">
        ID  <span className="text-cyan-300">Verify</span>
      </h1>

      <p className="text-gray-100 text-center mt-2 px-4 max-w-xl">
        This is a simple KYC app that uses facial recognition technology to verify your identity.
        Please follow the instructions to complete the process. Here we demonstrate a seamless
        and secure way to authenticate users.
      </p>

      {/* BUTTON */}
      <button
        onClick={handleGetStarted}
        className="bg-gradient-to-r from-cyan-400 to-cyan-600
                   text-xl text-white mt-4 px-24 py-4 rounded
                   hover:from-cyan-500 hover:to-cyan-700
                   transition-all duration-300"
      >
        Get Started
      </button>
    </div>
  );
};

export default HomePage;
