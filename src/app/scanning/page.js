'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ScanningPage = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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

  // Helper to convert data URL to Blob
  const dataUrlToBlob = (dataUrl) => {
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  };

  // Send KYC verification with documents and selfie
  const sendKycVerification = async (selfieBlob, userId) => {
    try {
      // Retrieve stored document images
      const docFrontDataUrl = sessionStorage.getItem('documentFront');
      const docBackDataUrl = sessionStorage.getItem('documentBack');

      if (!docFrontDataUrl || !selfieBlob) {
        console.error('Missing required documents or selfie');
        return { ok: false };
      }

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('merchant_id', MERCHANT_ID);
      formData.append('document_front', dataUrlToBlob(docFrontDataUrl), 'id_front.jpg');
      
      if (docBackDataUrl) {
        formData.append('document_back', dataUrlToBlob(docBackDataUrl), 'id_back.jpg');
      }
      
      formData.append('selfie', selfieBlob, 'selfie.jpg');

      const response = await fetch('https://api.cardnest.io/kyc/verify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`KYC API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('KYC verification response:', data);
      return { ok: true, data };
    } catch (err) {
      console.error('Error sending KYC verification:', err);
      return { ok: false };
    }
  };

  // Send liveness verification to backend
  const sendLivenessVerification = async () => {
    try {
      const frameData = captureFrame();
      const userId = generateRandomUserId();

      if (!frameData) {
        console.error('Failed to capture frame');
        return { ok: false };
      }

      // API appears to expect multipart/form-data; JSON body was rejected as missing fields
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('merchant_id', MERCHANT_ID);
      // Send as file field named face_images[] (common for multiple files); keep single for now
      formData.append('face_images', frameData, 'selfie.jpg');

      const response = await fetch('https://api.cardnest.io/kyc/liveness', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Liveness verification response:', data);

      const faceUrl = data?.output_images?.face || '';
      const livenessStatus = (data?.status || '').toString();
      const userIdFromApi = data?.user_id || userId;
      const profileId = data?.raw_data?.profile_id || '';

      // After liveness passes, send full KYC verification
      const kycResult = await sendKycVerification(frameData, userIdFromApi);

      if (!kycResult.ok) {
        console.error('KYC verification failed');
        return { ok: false };
      }

      const kycData = kycResult.data;
      const kycStatus = (kycData?.status || '').toString();
      const kycProfileId = kycData?.raw_data?.profile_id || profileId;

      try {
        sessionStorage.setItem('faceImageUrl', faceUrl);
        sessionStorage.setItem('livenessStatus', kycStatus); // Use KYC status
        sessionStorage.setItem('livenessUserId', userIdFromApi);
        sessionStorage.setItem('livenessProfileId', kycProfileId);
      } catch (storageError) {
        console.warn('Unable to cache liveness data', storageError);
      }

      return { ok: true, faceUrl, status: kycStatus };
    } catch (err) {
      console.error('Error sending liveness verification:', err);
      return { ok: false };
    }
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    // Only start scanning after camera is ready
    if (!isCameraReady) return;

    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Send liveness verification when progress is complete
          setIsLoading(true);
          sendLivenessVerification().then((result) => {
            setIsLoading(false);
            if (result.ok) {
              setTimeout(() => {
                router.push('/success');
              }, 500);
            } else {
              // Optionally reset or show error
              setProgress(0);
            }
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isCameraReady, router]);

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
        <p className="text-white mt-2 text-center">
          {!isCameraReady ? 'Initializing camera...' : isLoading ? 'Verifying... Please wait' : `Scanning... ${progress}%`}
        </p>
      </div>
    </div>
  );
};

export default ScanningPage;
