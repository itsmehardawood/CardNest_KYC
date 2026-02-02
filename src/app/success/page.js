'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const SuccessPage = () => {
  const router = useRouter();
  const [faceImage, setFaceImage] = useState('');
  const [status, setStatus] = useState(null); // Start as null to prevent flash
  const [userId, setUserId] = useState('');
  const [profileId, setProfileId] = useState('');
  const [verificationStage, setVerificationStage] = useState('');
  const [kycImages, setKycImages] = useState({});
  const [kycWarnings, setKycWarnings] = useState([]);

  // Refresh data function
  const refreshData = () => {
    try {
      const cached = sessionStorage.getItem('faceImageUrl') || '';
      const cachedStatus = sessionStorage.getItem('livenessStatus') || '';
      const cachedUserId = sessionStorage.getItem('livenessUserId') || '';
      const cachedProfileId = sessionStorage.getItem('livenessProfileId') || '';
      const stage = sessionStorage.getItem('verificationStage') || '';
      const kycOutputImages = JSON.parse(sessionStorage.getItem('kycOutputImages') || '{}');
      
      // Load stage-specific warnings (isolated per verification step)
      let warnings = [];
      if (stage === 'liveness') {
        // Only load liveness-specific warnings for liveness stage
        const livenessWarningsStr = sessionStorage.getItem('livenessWarnings') || '[]';
        warnings = JSON.parse(livenessWarningsStr);
      } else if (stage === 'document') {
        // Only load document-specific warnings for document stage
        const kycWarningsStr = sessionStorage.getItem('kycWarnings') || '[]';
        warnings = JSON.parse(kycWarningsStr);
      }

      setFaceImage(cached);
      setStatus(cachedStatus);
      setUserId(cachedUserId);
      setProfileId(cachedProfileId);
      setVerificationStage(stage);
      setKycImages(kycOutputImages);
      setKycWarnings(warnings);
    } catch (err) {
      console.warn('Unable to read cached data', err);
    }
  };

  useEffect(() => {
    // Initial load
    refreshData();
  }, []);

  const handlePrimary = () => {
    // Refresh data to ensure we have the latest state
    refreshData();

    // Small delay to let state update
    setTimeout(() => {
      const currentStage = sessionStorage.getItem('verificationStage') || '';
      const currentStatus = sessionStorage.getItem('livenessStatus') || '';
      const isCurrentPass = currentStatus === 'PASS' || currentStatus === 'ACCEPT';

      if (isCurrentPass) {
        // If document stage passed, move to liveness/face verification
        if (currentStage === 'document') {
          // Clear any previous liveness warnings before starting facial verification
          try {
            sessionStorage.removeItem('livenessWarnings');
          } catch (e) {}
          router.push('/scanning');
        } else {
          // Liveness stage passed - verification complete, go home or finish
          router.push('/');
        }
      } else {
        // If failed, go back to retry ONLY the current failed stage
        if (currentStage === 'liveness') {
          // Clear liveness-specific data for retry (keep document data intact)
          try {
            sessionStorage.removeItem('livenessWarnings');
            sessionStorage.removeItem('faceImageUrl');
            // Keep verificationStage as 'document' so scanning page knows document is already done
            sessionStorage.setItem('verificationStage', 'document');
          } catch (e) {}
          router.push('/scanning');
        } else {
          // Document verification failed - retry document only
          router.push('/document-type');
        }
      }
    }, 50);
  };

  const isPass = useMemo(() => {
    if (!status) return true; // Default to pass while loading to prevent flash
    const upperStatus = status.toUpperCase();
    return upperStatus === 'PASS' || upperStatus === 'ACCEPT';
  }, [status]);
  const badgeColor = isPass ? 'bg-red-900' : 'bg-gray-800';
  const accentColor = isPass ? 'text-white' : 'text-red-400';
  const borderColor = isPass ? 'border-red-700' : 'border-red-600';
  const statusText = isPass ? 'Successful' : 'Failed';
  const helperText = isPass 
    ? (verificationStage === 'document' ? 'Document verified successfully' : 'Identity confirmed') 
    : 'Please retry your verification';
  const titleText = 'Scan Complete';
  const primaryLabel = isPass 
    ? (verificationStage === 'document' ? 'Proceed to Face Verification' : 'Finish') 
    : (verificationStage === 'liveness' ? 'Retry Face Scan' : 'Retry Documents');

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-8 overflow-y-auto bg-black">
      <div className={`w-12 h-12 mt-10 rounded-full ${badgeColor} flex items-center justify-center flex-shrink-0`}>
        <svg
          className="w-10 h-10 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d={isPass ? 'M5 13l4 4L19 7' : 'M6 6l12 12M6 18L18 6'} 
          />
        </svg>
      </div>
      <h1 className={`${accentColor} text-3xl mt-4 text-center`}>{titleText}</h1>
  
      <p className="text-gray-300 mt-3 text-base md:text-lg mb-8 text-center px-4">{helperText}</p>

      {/* Display liveness face image ONLY for liveness stage */}
      {verificationStage === 'liveness' && faceImage && (
        <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full border-4 ${borderColor} bg-gray-900/30 flex items-center justify-center mt-2 mb-6 overflow-hidden flex-shrink-0 shadow-xl`}>
          <img
            src={faceImage}
            alt="Liveness selfie"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Display document images for document stage only */}
      {verificationStage === 'document' && kycImages && (
        <div className="w-full max-w-4xl mb-8">
          {/* Face image from document in circular frame */}
          {/* {kycImages.face && (
            <div className="flex justify-center mb-6">
              <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-4 ${borderColor} bg-gray-700 overflow-hidden shadow-xl`}>
                <img 
                  src={kycImages.face} 
                  alt="Face from Document" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          )} */}
          
          {/* Document images in grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
            {kycImages.front && (
              <div className="bg-gray-900/50 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition hover:shadow-2xl">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <p className="text-gray-300 text-sm font-semibold">ID Front</p>
                </div>
                <div className="p-2 overflow-hidden rounded-lg">
                  <img 
                    src={kycImages.front} 
                    alt="ID Front" 
                    className="w-full h-48 object-cover rounded-lg scale-140" 
                  />
                </div>
              </div>
            )}
            {kycImages.back && (
              <div className="bg-gray-900/50 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition hover:shadow-2xl">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <p className="text-gray-300 text-sm font-semibold">ID Back</p>
                </div>
                <div className="p-2 overflow-hidden rounded-lg">
                  <img 
                    src={kycImages.back} 
                    alt="ID Back" 
                    className="w-full h-48 object-cover rounded-lg scale-110" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center space-y-2 text-center">
        {verificationStage === 'liveness' && (
          <div className={isPass ? "border-4 border-green-600 rounded-lg p-4 bg-green-950/30" : ""}>
            <p className="text-gray-100 text-lg">{isPass ? 'Congratulations we have successfully confirmed, matched, and verified your face against our intelligence system' : 'Face verification needs retry'}</p>
          </div>
        )}
        {verificationStage === 'document' && (
          <p className="text-gray-300 text-xl">Document can {isPass ? 'passed' : 'needs retry'}</p>
        )}
        {!isPass && (
          <div className="mt-3 px-6 py-2 rounded-full bg-red-600">
            <p className="text-white text-lg font-semibold">Status: {statusText}</p>
          </div>
        )}
      </div>


    

      <p className="text-gray-300 text-lg md:text-xl mt-10 text-center">
        {isPass 
          ? (verificationStage === 'document' ? 'Next Step: We will need to recognize and verify your face in real-time against your document we processed.' : 'Thank you!') 
          : 'Please try again'}
      </p>
      <button 
        onClick={handlePrimary}
        className="bg-red-900 text-white mt-6 px-8 py-3 rounded-lg hover:bg-red-800 transition-colors w-full max-w-xs border border-red-700"
      >
        {primaryLabel}
      </button>
    </div>
  );
};

export default SuccessPage;
