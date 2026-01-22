'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const SuccessPage = () => {
  const router = useRouter();
  const [faceImage, setFaceImage] = useState('');
  const [status, setStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [profileId, setProfileId] = useState('');

  const handlePrimary = () => {
    if (isPass) {
      router.push('/document-verification');
    } else {
      router.push('/scanning');
    }
  };

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('faceImageUrl') || '';
      const cachedStatus = sessionStorage.getItem('livenessStatus') || '';
      const cachedUserId = sessionStorage.getItem('livenessUserId') || '';
      const cachedProfileId = sessionStorage.getItem('livenessProfileId') || '';
      setFaceImage(cached);
      setStatus(cachedStatus);
      setUserId(cachedUserId);
      setProfileId(cachedProfileId);
    } catch (err) {
      console.warn('Unable to read cached face image URL', err);
    }
  }, []);

  const isPass = useMemo(() => status.toUpperCase() === 'PASS', [status]);
  const badgeColor = isPass ? 'bg-cyan-500' : 'bg-rose-600';
  const accentColor = isPass ? 'text-cyan-600' : 'text-rose-500';
  const borderColor = isPass ? 'border-cyan-500' : 'border-rose-500';
  const helperText = isPass ? 'ID Confirmation, You May Enter' : 'Verification failed. Please retry.';
  const titleText = isPass ? 'Successful!' : 'Verification Failed';
  const primaryLabel = isPass ? 'Proceed' : 'Retake';

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-800 px-4 py-8">
      <div className={`w-12 h-12 mt-10 rounded-full ${badgeColor} flex items-center justify-center`}>
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
      <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full border-4 ${borderColor} bg-gray-700 flex items-center justify-center mt-2 overflow-hidden`}>
        {faceImage ? (
          <img
            src={faceImage}
            alt="Liveness selfie"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-sm">No selfie captured</span>
        )}
      </div>
      <div className="mt-6 flex flex-col items-center space-y-2 text-center">
        <p className={`${accentColor} text-3xl md:text-4xl font-semibold`}>Scan Complete</p>
        <p className={`${accentColor} text-sm md:text-lg`}>Profile ID: <span className='text-gray-200'>{profileId || 'N/A'}</span></p>
        <p className={`${accentColor} text-sm md:text-lg`}>Employee ID: <span className='text-gray-200'>{userId || 'N/A'}</span></p>
        <p className={`${accentColor} text-sm md:text-lg`}>Status: <span className='text-gray-200'>{status || 'Unknown'}</span></p>
      </div>

      <p className="text-gray-300 text-lg md:text-xl mt-10 text-center">{isPass ? 'Thank you and have a good day!' : 'Please retake your liveness check.'}</p>
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
