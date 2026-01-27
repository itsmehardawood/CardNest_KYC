'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ScanningPage = () => {
  const router = useRouter();
  const [showPreparation, setShowPreparation] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0: right, 1: left, 2: up, 3: down
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const isVerificationSentRef = useRef(false);
  const streamRef = useRef(null);
  const MERCHANT_ID = '434343j4n43k4';

  const movements = [
    { direction: 'right', label: 'Turn your face to the RIGHT', icon: '→' },
    { direction: 'left', label: 'Turn your face to the LEFT', icon: '←' },
    { direction: 'up', label: 'Look UP', icon: '↑' },
    { direction: 'down', label: 'Look DOWN', icon: '↓' },
  ];

  // Generate random user ID
  const generateRandomUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Start camera
  useEffect(() => {
    // Ensure user went through document verification first
    const stage = sessionStorage.getItem('verificationStage');
    if (stage !== 'document') {
      router.push('/document-type');
      return;
    }

    let isMounted = true;

    // Access the camera
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        });

        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        
        // Wait for video element to be available
        const attachStream = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Wait for video to be ready to play
            videoRef.current.onloadedmetadata = () => {
              if (isMounted) {
                setCameraReady(true);
              }
            };

            // Fallback: mark as ready after 2 seconds even if event doesn't fire
            setTimeout(() => {
              if (isMounted && videoRef.current && videoRef.current.srcObject) {
                setCameraReady(true);
              }
            }, 2000);
          } else {
            // Retry if video ref not ready yet
            setTimeout(attachStream, 100);
          }
        };

        attachStream();
      } catch (err) {
        if (isMounted) {
          alert('Camera access is required for face verification. Please enable camera permissions.');
          router.push('/document-type');
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      // Cleanup: stop all video tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [router]);

  // Ensure video element always has stream attached
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showPreparation]); // Re-run when screen changes

  // Start liveness check
  const handleStartCheck = () => {
    if (!cameraReady || !streamRef.current) {
      alert('Camera is still initializing. Please wait a moment and try again.');
      return;
    }
    
    setShowPreparation(false);
    setCurrentStep(0);
    setProgress(0);
    
    // Start recording after a brief delay to ensure UI has updated
    setTimeout(() => {
      startRecording();
    }, 500);
  };

  // Start video recording
  const startRecording = () => {
    // Use streamRef instead of videoRef.current.srcObject for reliability
    if (!streamRef.current) {
      alert('Camera is not ready. Please try again.');
      setShowPreparation(true);
      return;
    }

    recordedChunksRef.current = [];
    
    try {
      const stream = streamRef.current;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        sendLivenessVerification();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start movement sequence
      startMovementSequence();
    } catch (err) {
      alert('Failed to start recording. Please try again.');
      setShowPreparation(true);
    }
  };

  // Movement sequence - 5 seconds per movement (slowed down for better accuracy)
  const startMovementSequence = () => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      setProgress((step / movements.length) * 100);

      if (step >= movements.length) {
        clearInterval(interval);
        // Recording complete, stop recording
        setTimeout(() => {
          stopRecording();
        }, 5000); // Hold last position for 5 seconds
      }
    }, 5000);
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // Send liveness verification with video
  const sendLivenessVerification = async () => {
    if (isVerificationSentRef.current) {
      return;
    }

    isVerificationSentRef.current = true;

    try {
      const userId = generateRandomUserId();
      
      if (recordedChunksRef.current.length === 0) {
        throw new Error('No video recorded');
      }

      // Create video blob
      const videoBlob = new Blob(recordedChunksRef.current, {
        type: 'video/webm',
      });

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('merchant_id', MERCHANT_ID);
      formData.append('face_video', videoBlob, 'liveness_video.webm');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kyc/liveness`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Log full API response for debugging
      // console.log('=== LIVENESS API FULL RESPONSE ===' );
      // console.log(JSON.stringify(data, null, 2));
      // console.log('==================================');

      const faceUrl = data?.output_images?.face || '';
      const livenessStatus = (data?.status || '').toString();
      const userIdFromApi = data?.user_id || userId;
      const profileId = data?.raw_data?.profile_id || '';
      const livenessWarnings = data?.warnings || [];

      // Cache liveness results (isolated from document verification)
      try {
        sessionStorage.setItem('faceImageUrl', faceUrl);
        sessionStorage.setItem('livenessStatus', livenessStatus);
        sessionStorage.setItem('livenessUserId', userIdFromApi);
        sessionStorage.setItem('livenessProfileId', profileId);
        sessionStorage.setItem('verificationStage', 'liveness');
        // Store liveness-specific warnings (separate from document warnings)
        sessionStorage.setItem('livenessWarnings', JSON.stringify(livenessWarnings));
      } catch (storageError) {
        // Storage error - continue anyway
      }

      // Navigate to success
      setTimeout(() => {
        router.push('/success');
      }, 500);

    } catch (err) {
      alert('Verification failed. Please try again.');
      isVerificationSentRef.current = false;
      setIsProcessing(false);
      setShowPreparation(true);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{backgroundColor: '#3f0000'}}>
      {/* Preparation Screen */}
      {showPreparation && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-20">
          <div className="max-w-md w-full space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/20 p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-white">
                Face Liveness Check
              </h1>
              <p className="text-red-100 text-lg">
                We need to verify that you're a real person
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-red-900/30 rounded-xl p-6 space-y-4 border border-red-700/50">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Instructions
              </h2>
              <ul className="space-y-3 text-red-100">
                <li className="flex items-start gap-3">
                  <span className="text-red-200 font-bold flex-shrink-0">1.</span>
                  <span>Position your face within the oval frame</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-200 font-bold flex-shrink-0">2.</span>
                  <span>Follow the instructions to move your face in different directions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-200 font-bold flex-shrink-0">3.</span>
                  <span>Keep your movements slow and steady</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-200 font-bold flex-shrink-0">4.</span>
                  <span>The process will take about 12 seconds</span>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-red-500/10 rounded-lg border border-red-500/30 p-4">
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-200 flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="text-sm text-red-100 space-y-1">
                  <p className="font-semibold">Tips for best results:</p>
                  <p>Ensure good lighting and remove glasses if possible</p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartCheck}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-red-500/50"
            >
              Start Face Verification
            </button>

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="w-full text-red-200 hover:text-white font-medium py-2 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Hidden video for preparation screen - keeps stream alive */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      ></video>

      {/* Liveness Check Screen */}
      {!showPreparation && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
          {/* Current instruction */}
          <div className="mb-8 text-center">
            {!isProcessing ? (
              <>
                <div className="text-6xl mb-4 animate-pulse">
                  {movements[currentStep]?.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {movements[currentStep]?.label}
                </h2>
                <p className="text-gray-400">
                  Step {currentStep + 1} of {movements.length}
                </p>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Processing...
                </h2>
                <p className="text-gray-400">
                  Verifying your liveness
                </p>
              </>
            )}
          </div>

          {/* Video with face oval - use same video element for smooth continuous stream */}
          <div className="relative w-80 h-96 mb-8">
            <div className="w-full h-full object-cover rounded-2xl border-2 border-slate-700 overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              ></video>
            </div>

            {/* Face oval overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="border-4 border-cyan-500 border-dotted"
                style={{
                  width: '65%',
                  height: '70%',
                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                  borderRadius: '50% 50% 45% 45% / 40% 40% 60% 60%',
                  transition: 'all 0.3s ease',
                }}
              ></div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-80">
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-3 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-gray-400 text-sm">
              {isProcessing ? 'Analyzing...' : `${Math.round(progress)}% Complete`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanningPage;
