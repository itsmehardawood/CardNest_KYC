'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ScanningPage = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    // Access the camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
      });

    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push('/success');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-around py-20 h-screen bg-slate-800">
      <h1 className="text-gray-300 text-2xl">Please Wait!</h1>

      <div className="relative w-80 h-100 mt-4">
        {/* Camera Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg"
        ></video>

        {/* Square bounding box */}
        <div className="absolute inset-0 border-2 border-cyan-700 border-opacity-50 rounded-lg"></div>

        {/* Realistic face-shaped oval with cyan background */}
        <div className="absolute inset-0 flex items-center justify-center">
       <div
  className="border-4 border-cyan-500 border-dotted opacity-80"
  style={{
    width: '60%',                   // slightly narrower than video
    height: '65%',                  // taller
    backgroundColor: 'rgba(0, 255, 255, 0.2)', // cyan 20% opacity
              borderRadius: '60% 60% 50% 50% / 40% 40% 60% 60%', // rounded chin
  }}
></div>

        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 w-64">
        <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
          <div
            className="bg-cyan-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white mt-2 text-center">Scanning... {progress}%</p>
      </div>
    </div>
  );
};

export default ScanningPage;
