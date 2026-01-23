'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ScanningPage = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3, 2, 1 countdown
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isVerificationSentRef = useRef(false); // Prevent duplicate API calls
  const MERCHANT_ID = '434343j4n43k4';

  // Generate random user ID
  const generateRandomUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Capture frame and return JPEG Blob (API expects file upload)
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);

      // Convert data URL to Blob so we can append as a file
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: 'image/jpeg' });
    }
    return null;
  };

  // Send liveness verification to backend - ONLY ONCE
  const sendLivenessVerification = async () => {
    // Prevent duplicate calls - critical for cost control
    if (isVerificationSentRef.current) {
      console.log('Verification already sent, skipping duplicate call');
      return { ok: false, duplicate: true };
    }

    // Mark as sent immediately to prevent race conditions
    isVerificationSentRef.current = true;

    try {
      const frameData = captureFrame();
      const userId = generateRandomUserId();

      if (!frameData) {
        console.error('Failed to capture frame');
        isVerificationSentRef.current = false; // Reset on failure
        return { ok: false };
      }

      // API expects multipart/form-data
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('merchant_id', MERCHANT_ID);
      formData.append('face_images', frameData, 'selfie.jpg');

      const response = await fetch('https://api.cardnest.io/kyc/liveness', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        isVerificationSentRef.current = false; // Reset on error to allow retry
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      // console.log('Liveness verification response:', data);

      const faceUrl = data?.output_images?.face || '';
      const livenessStatus = (data?.status || '').toString();
      const userIdFromApi = data?.user_id || userId;
      const profileId = data?.raw_data?.profile_id || '';

      // Cache liveness results for document verification page
      try {
        sessionStorage.setItem('faceImageUrl', faceUrl);
        sessionStorage.setItem('livenessStatus', livenessStatus);
        sessionStorage.setItem('livenessUserId', userIdFromApi);
        sessionStorage.setItem('livenessProfileId', profileId);
      } catch (storageError) {
        console.warn('Unable to cache liveness data', storageError);
      }

      return { ok: true, faceUrl, status: livenessStatus };
    } catch (err) {
      console.error('Error sending liveness verification:', err);
      return { ok: false };
    }
  };

  useEffect(() => {
    // Ensure user went through document verification first
    const stage = sessionStorage.getItem('verificationStage');
    if (stage !== 'document') {
      // Redirect to document verification if not completed
      router.push('/document-verification');
      return;
    }

    // Access the camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait 1-2 seconds after camera is initialized
          setTimeout(() => {
            setIsCameraReady(true);
          }, 1500);
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
      });

    return () => {
      // Cleanup: stop all video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [router]);

  useEffect(() => {
    // Start countdown immediately when camera is ready
    if (!isCameraReady || countdown !== null) return;
    
    setCountdown(3);
  }, [isCameraReady, countdown]);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished (reached 0), send verification
      if (!isVerificationSentRef.current && !isLoading) {
        setIsLoading(true);
        sendLivenessVerification().then((result) => {
          setIsLoading(false);
          
          // Handle duplicate call attempt
          if (result.duplicate) {
            console.log('Duplicate verification prevented');
            return;
          }
          
          if (result.ok) {
            setTimeout(() => {
              // Mark this as final liveness verification stage (after document)
              sessionStorage.setItem('verificationStage', 'liveness');
              router.push('/success');
            }, 500);
          } else {
            // On error, allow retry by resetting the flag
            isVerificationSentRef.current = false;
            setCountdown(null);
          }
        });
      }
    }
  }, [countdown, isLoading, router]);

  // Simulate progress bar during verification
  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Stop at 90% until API responds
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="flex flex-col items-center justify-around py-20 h-screen bg-slate-800">
      <h1 className="text-gray-300 text-2xl">Please Wait!</h1>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden"></canvas>

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
  className="border-4 border-cyan-500 border-dotted opacity-80 flex items-center justify-center"
  style={{
    width: '60%',                   // slightly narrower than video
    height: '65%',                  // taller
    backgroundColor: 'rgba(0, 255, 255, 0.2)', // cyan 20% opacity
              borderRadius: '60% 60% 50% 50% / 40% 40% 60% 60%', // rounded chin
  }}
>
  {/* Countdown number inside face oval */}
  {countdown !== null && countdown > 0 && (
    <div className="text-white text-8xl font-bold animate-pulse">
      {countdown}
    </div>
  )}
</div>

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
        <p className="text-white mt-2 text-center">
          {!isCameraReady ? 'Initializing camera...' : isLoading ? `Verifying... ${progress}%` : countdown !== null && countdown > 0 ? 'Get ready...' : 'Processing...'}
        </p>
      </div>
    </div>
  );
};

export default ScanningPage;
