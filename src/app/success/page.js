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

  const handlePrimary = () => {
    if (isPass) {
      // If document stage passed, move to liveness/face verification
      if (verificationStage === 'document') {
        router.push('/scanning');
      } else {
        // Liveness stage passed - verification complete, go home or finish
        router.push('/');
      }
    } else {
      // If failed, go back to retry the current stage
      if (verificationStage === 'liveness') {
        router.push('/scanning');
      } else {
        router.push('/document-type');
      }
    }
  };

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('faceImageUrl') || '';
      const cachedStatus = sessionStorage.getItem('livenessStatus') || '';
      const cachedUserId = sessionStorage.getItem('livenessUserId') || '';
      const cachedProfileId = sessionStorage.getItem('livenessProfileId') || '';
      const stage = sessionStorage.getItem('verificationStage') || '';
      const kycOutputImages = JSON.parse(sessionStorage.getItem('kycOutputImages') || '{}');
      const kycWarningsStr = sessionStorage.getItem('kycWarnings') || '[]';
      const warnings = JSON.parse(kycWarningsStr);

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
  }, []);

  const isPass = useMemo(() => {
    if (!status) return true; // Default to pass while loading to prevent flash
    const upperStatus = status.toUpperCase();
    return upperStatus === 'PASS' || upperStatus === 'ACCEPT';
  }, [status]);
  const badgeColor = isPass ? 'bg-cyan-500' : 'bg-rose-600';
  const accentColor = isPass ? 'text-cyan-600' : 'text-rose-500';
  const borderColor = isPass ? 'border-cyan-500' : 'border-rose-500';
  const helperText = isPass 
    ? (verificationStage === 'document' ? 'Document verified! Proceed to face verification.' : 'ID Confirmation, You May Enter') 
    : 'Verification failed. Please retry.';
  const titleText = isPass ? 'Successful!' : 'Verification Failed';
  const primaryLabel = isPass 
    ? (verificationStage === 'document' ? 'Proceed to Face Verification' : 'Finish') 
    : (verificationStage === 'liveness' ? 'Retake Face Scan' : 'Retake Documents');

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-800 px-4 py-8 overflow-y-auto">
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
      <p className="text-gray-300 mt-2 text-base md:text-lg mb-8 text-center px-4">{helperText}</p>

      {/* Display liveness face image ONLY for liveness stage */}
      {verificationStage === 'liveness' && faceImage && (
        <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full border-4 ${borderColor} bg-gray-700 flex items-center justify-center mt-2 mb-6 overflow-hidden flex-shrink-0 shadow-xl`}>
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
              <div className="bg-gray-700/50 rounded-xl overflow-hidden shadow-lg border border-gray-600/50 transition hover:shadow-2xl">
                <div className="bg-gray-800/70 px-4 py-2 border-b border-gray-600/50">
                  <p className="text-cyan-400 text-sm font-semibold">ID Front</p>
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
              <div className="bg-gray-700/50 rounded-xl overflow-hidden shadow-lg border border-gray-600/50 transition hover:shadow-2xl">
                <div className="bg-gray-800/70 px-4 py-2 border-b border-gray-600/50">
                  <p className="text-cyan-400 text-sm font-semibold">ID Back</p>
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
        <p className={`${accentColor} text-3xl md:text-4xl font-semibold`}>Scan Complete</p>
        {/* <p className={`${accentColor} text-sm md:text-lg`}>Profile ID: <span className='text-gray-200'>{profileId || 'N/A'}</span></p> */}
        {/* <p className={`${accentColor} text-sm md:text-lg`}>Employee ID: <span className='text-gray-200'>{userId || 'N/A'}</span></p> */}
        <p className={`${accentColor} text-sm md:text-lg`}>Status: <span className='text-gray-200'>{status || 'Unknown'}</span></p>
      </div>

      {/* Display warnings if verification failed */}
      {(verificationStage === 'document' || verificationStage === 'liveness') && !isPass && kycWarnings.length > 0 && (
        <div className="mt-8 w-full max-w-md bg-rose-900/30 border border-rose-500/50 rounded-lg p-4">
          <p className="text-rose-400 font-semibold mb-2">Issues Found:</p>
          <ul className="text-rose-200 text-sm space-y-1">
            {kycWarnings.map((warning, idx) => (
              <li key={idx} className="list-disc list-inside">
                {warning.description || warning.code}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-gray-300 text-lg md:text-xl mt-10 text-center">
        {isPass 
          ? (verificationStage === 'document' ? 'Next step: Face verification for liveness check.' : 'Thank you and have a good day!') 
          : (verificationStage === 'liveness' ? 'Please retake your liveness check.' : 'Please retake your documents.')}
      </p>
      <button 
        onClick={handlePrimary}
        className={`${badgeColor} text-white mt-6 px-8 py-3 rounded-lg hover:opacity-90 transition-colors w-full max-w-xs`}
      >
        {primaryLabel}
      </button>
    </div>
  );
};

export default SuccessPage;
