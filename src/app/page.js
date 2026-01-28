'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const router = useRouter();
  const [lines, setLines] = useState([]);

  const handleGetStarted = () => {
    router.push('/document-type');
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
    <div className="flex flex-col items-center justify-around py-20 h-screen bg-black">

      {/* KYC VERIFICATION VISUALS */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8">
        
        {/* GOVERNMENT ID CARD VISUAL */}
        <div className="relative w-36 h-24 md:w-48 md:h-32">
          {/* ID Card Border */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 128">
            <rect
              x="4" y="4" width="184" height="120"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              rx="8"
              ry="8"
            />
            {/* Inner card details */}
            <rect x="12" y="12" width="40" height="32" fill="#ffffff" opacity="0.3" rx="2"/>
            <line x1="60" y1="16" x2="140" y2="16" stroke="#ffffff" strokeWidth="1.5" opacity="0.7"/>
            <line x1="60" y1="24" x2="120" y2="24" stroke="#ffffff" strokeWidth="1.5" opacity="0.7"/>
            <line x1="60" y1="32" x2="160" y2="32" stroke="#ffffff" strokeWidth="1.5" opacity="0.7"/>
            <line x1="12" y1="52" x2="180" y2="52" stroke="#ffffff" strokeWidth="1" opacity="0.5"/>
            <line x1="12" y1="60" x2="140" y2="60" stroke="#ffffff" strokeWidth="1" opacity="0.5"/>
            <line x1="12" y1="68" x2="160" y2="68" stroke="#ffffff" strokeWidth="1" opacity="0.5"/>
            <line x1="12" y1="76" x2="120" y2="76" stroke="#ffffff" strokeWidth="1" opacity="0.5"/>
          </svg>
          <div className="absolute top-2 right-2 text-white text-xs font-bold opacity-70">ID</div>
        </div>

        {/* PLUS ICON */}
        <div className="text-white text-4xl font-bold opacity-70">+</div>

        {/* REALISTIC FACE SHAPE */}
        <div className="relative w-32 h-44 md:w-40 md:h-56">
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
            stroke="#ffffff"
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
                className="absolute h-[1px] bg-white"
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
                className="absolute w-[1px] bg-white"
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
              className="absolute h-[1px] bg-white origin-left"
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
      </div>

      {/* CARDNEST KYC TITLE */}
      <div className="text-center mb-6">
        <h1 className="text-white text-3xl md:text-5xl font-bold">
          CardNest <span className="text-red-700">KYC</span>
        </h1>
      </div>

      {/* TEXT */}
      <p className="text-white text-center mt-2 px-4 max-w-2xl text-base md:text-lg leading-relaxed">
        Welcome to CardNest KYC Verification - Your cooperation in this verification process helps us maintain a secure environment and deliver reliable services, and safeguard our customers' information.
      </p>

      {/* BUTTON */}
      <button
        onClick={handleGetStarted}
        className="bg-red-900
                   text-lg md:text-xl text-white mt-8 px-12 md:px-24 py-3 md:py-4 rounded-lg
                   hover:bg-red-800
                   transition-all duration-300 shadow-lg
                   border border-red-700 hover:border-red-600"
      >
        Get Started
      </button>
    </div>
  );
};

export default HomePage;
