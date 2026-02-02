
'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ScanningPage = () => {
  const router = useRouter();
  const [showPreparation, setShowPreparation] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [currentStep, setCurrentStep] = useState(0); // 0: right, 1: left, 2: up, 3: down
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentDirection, setCurrentDirection] = useState(''); // 'right', 'left', 'up', 'down'
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);
  const videoRef = useRef(null);
  const scanningVideoRef = useRef(null);
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
    if (streamRef.current) {
      // Attach to hidden video ref
      if (videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
      }
      // Attach to scanning video ref when visible
      if (scanningVideoRef.current && !scanningVideoRef.current.srcObject) {
        scanningVideoRef.current.srcObject = streamRef.current;
      }
    }
  }, [showPreparation, showCountdown]); // Re-run when screen changes

  // Attach stream to scanning video when it becomes visible
  useEffect(() => {
    if (!showPreparation && !showCountdown && streamRef.current && scanningVideoRef.current) {
      scanningVideoRef.current.srcObject = streamRef.current;
      scanningVideoRef.current.play().catch(() => {});
    }
  }, [showPreparation, showCountdown]);

  // Start liveness check with countdown
  const handleStartCheck = () => {
    if (!cameraReady || !streamRef.current) {
      alert('Camera is still initializing. Please wait a moment and try again.');
      return;
    }
    
    setShowPreparation(false);
    setShowCountdown(true);
    setCountdownValue(3);
    
    // Start countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownValue(count);
      } else {
        clearInterval(countdownInterval);
        setShowCountdown(false);
        setCurrentStep(0);
        setProgress(0);
        setCurrentDirection('');
        // Start recording after countdown
        setTimeout(() => {
          startRecording();
        }, 300);
      }
    }, 1000);
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

  // Movement sequence - slower with hold validation
  const startMovementSequence = () => {
    processStep(0);
  };

  // Process each step with hold validation
  const processStep = (stepIndex) => {
    if (stepIndex >= movements.length) {
      // All steps completed, stop recording
      setTimeout(() => {
        stopRecording();
      }, 500);
      return;
    }

    const direction = movements[stepIndex].direction;
    setCurrentStep(stepIndex);
    setCurrentDirection(direction);
    setHoldProgress(0);

    // Simulate hold detection - user needs to hold position for 3 seconds
    let holdTime = 0;
    const holdDuration = 3000; // 3 seconds to hold
    const holdInterval = 100; // Update every 100ms
    
    holdTimerRef.current = setInterval(() => {
      holdTime += holdInterval;
      const progressPercent = Math.min((holdTime / holdDuration) * 100, 100);
      setHoldProgress(progressPercent);
      
      if (holdTime >= holdDuration) {
        clearInterval(holdTimerRef.current);
        
        // Update overall progress
        setProgress(((stepIndex + 1) / movements.length) * 100);
        
        // Brief pause before next step
        setTimeout(() => {
          processStep(stepIndex + 1);
        }, 800);
      }
    }, holdInterval);
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

  // Get border style based on current direction
  const getOvalBorderStyle = () => {
    if (!currentDirection) return 'border-white border-dotted';
    
    const baseClasses = 'border-4 transition-all duration-300';
    
    // Create gradient borders based on direction
    switch (currentDirection) {
      case 'right':
        return `${baseClasses} border-transparent bg-gradient-to-r from-transparent via-transparent to-green-400 bg-clip-border`;
      case 'left':
        return `${baseClasses} border-transparent bg-gradient-to-l from-transparent via-transparent to-green-400 bg-clip-border`;
      case 'up':
        return `${baseClasses} border-transparent bg-gradient-to-t from-transparent via-transparent to-green-400 bg-clip-border`;
      case 'down':
        return `${baseClasses} border-transparent bg-gradient-to-b from-transparent via-transparent to-green-400 bg-clip-border`;
      default:
        return 'border-4 border-white border-dotted';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Preparation Screen */}
      {showPreparation && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
          <div className="max-w-md w-full space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-red-900/40 p-6">
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
                Facial Recognition and Verification 
              </h1>
              <p className="text-gray-300 text-lg">
                We are required to verify your face in real time to help complete your identification process.
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gray-900/50 rounded-xl p-6 space-y-4 border border-gray-700">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500"
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
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold flex-shrink-0">1.</span>
                  <span>Position your face within the oval frame</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold flex-shrink-0">2.</span>
                  <span>Follow the instructions to move your face in different directions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold flex-shrink-0">3.</span>
                  <span>Keep your movements slow and steady</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold flex-shrink-0">4.</span>
                  <span>The oval border will highlight the direction you need to move</span>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-red-900/20 rounded-lg border border-red-900/50 p-4">
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="text-sm text-gray-300 space-y-1">
                  <p className="font-semibold">Tips for best results:</p>
                  <p>Ensure good lighting and remove glasses if possible</p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartCheck}
              className="w-full bg-red-900 hover:bg-red-800 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-red-900/50 border border-red-700"
            >
              Start Face Verification
            </button>

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="w-full text-gray-400 hover:text-white font-medium py-2 transition-colors"
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

      {/* Countdown Screen */}
      {showCountdown && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-10">
          <div className="text-center">
            <p className="text-gray-300 text-xl mb-4">Get Ready!</p>
            <div className="w-40 h-40 rounded-full bg-gray-900 border-4 border-red-700 flex items-center justify-center mx-auto animate-pulse">
              <span className="text-8xl font-bold text-white">{countdownValue}</span>
            </div>
            <p className="text-white text-lg mt-6">Position your face in the frame</p>
          </div>
        </div>
      )}

      {/* Liveness Check Screen */}
      {!showPreparation && !showCountdown && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-6">
          {/* Show processing message or instruction */}
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-center">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-400 border-t-transparent mb-6"></div>
              <h2 className="text-2xl font-bold text-white mb-3 text-center">
                CardNest Facial Intelligence Verification in process...
              </h2>
              <p className="text-gray-300 text-lg text-center">
                Please wait
              </p>
            </div>
          ) : (
            <>
              {/* Current instruction */}
              <div className="mb-6 text-center">
                <div className="bg-black/60 border-2 border-green-400 rounded-xl px-6 py-4 shadow-lg shadow-green-500/30">
                  <div className="text-5xl mb-2 animate-bounce">
                    {movements[currentStep]?.icon}
                  </div>
                  <h2 className="text-xl font-bold text-green-300 mb-1">
                    {movements[currentStep]?.label}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Hold position • Step {currentStep + 1} of {movements.length}
                  </p>
                  {/* Hold progress indicator */}
                  <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-300 to-green-400 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${holdProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Video with oval that highlights based on direction */}
              <div className="relative w-[340px] h-[420px] mb-6">
                <div className="w-full h-full object-cover rounded-2xl border-4 border-black overflow-hidden bg-black">
                  <video
                    ref={scanningVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  ></video>
                </div>

                {/* Face oval overlay with directional highlighting */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Oval with directional border highlight */}
                  <div
                    className="relative"
                    style={{
                      width: '75%',
                      height: '80%',
                    }}
                  >
                    {/* Base oval shape */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '50% 50% 45% 45% / 40% 40% 60% 60%',
                      }}
                    ></div>
                    
                    {/* Directional border highlights */}
                    {currentDirection === 'right' && (
                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-green-400 animate-pulse"
                        style={{
                          borderRadius: '0 50% 50% 0',
                          boxShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
                        }}
                      ></div>
                    )}
                    
                    {currentDirection === 'left' && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-green-400 animate-pulse"
                        style={{
                          borderRadius: '50% 0 0 50%',
                          boxShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
                        }}
                      ></div>
                    )}
                    
                    {currentDirection === 'up' && (
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-green-400 animate-pulse"
                        style={{
                          borderRadius: '50% 50% 0 0',
                          boxShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
                        }}
                      ></div>
                    )}
                    
                    {currentDirection === 'down' && (
                      <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-green-400 animate-pulse"
                        style={{
                          borderRadius: '0 0 50% 50%',
                          boxShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
                        }}
                      ></div>
                    )}

                    {/* White dotted border when no direction */}
                    {!currentDirection && (
                      <div
                        className="absolute inset-0 border-4 border-white border-dotted"
                        style={{
                          borderRadius: '50% 50% 45% 45% / 40% 40% 60% 60%',
                        }}
                      ></div>
                    )}

                    {/* Solid border outline */}
                    <div
                      className="absolute inset-0 border-2 border-white/30"
                      style={{
                        borderRadius: '50% 50% 45% 45% / 40% 40% 60% 60%',
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Progress Bar - only show when not processing */}
          {!isProcessing && (
            <div className="w-80">
              <div className="w-full bg-black rounded-full h-3 overflow-hidden mb-2 border border-gray-700">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-300 text-sm">
                {isProcessing ? 'Analyzing...' : `${Math.round(progress)}% Complete`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanningPage;