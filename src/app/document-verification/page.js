'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';


const CameraModal = ({ open, sideLabel, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const start = async () => {
      if (!open) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Camera access denied', error);
      }
    };

    const stop = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    start();
    return stop;
  }, [open]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(dataUrl);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-start justify-between p-4">
        <button
          type="button"
          onClick={onClose}
          className="text-md font-semibold text-gray-700 transition hover:text-gray-600"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 flex-col mx-auto items-center  px-4">
        <div className="mb-4 text-center  mt-10">
          <h2 className="text-3xl font-semibold text-gray-900">Take Photo of Your ID</h2>
          <p className='text-gray-600'>Keep your ID steady and ensure all details are visible. Please wait for the camera to adjust.</p>
        </div>

        <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-gray-50 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-96 w-full object-cover"
          />
          
          {/* Transparent ID card placeholder overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-4/5 h-3/5">
              {/* Dark overlay around the ID area */}
              <div className="absolute inset-0 border-4 border-dashed border-cyan-500 rounded-lg bg-transparent opacity-80"></div>
              
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
              

            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={handleCapture}
          className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-lg font-semibold text-white transition hover:bg-cyan-600"
        >
          Capture &amp; confirm
        </button>
      </div>
    </div>
  );
};

const PlaceholderCard = ({ label, image, placeholderSrc, isCaptured, onClick }) => {
  const displaySrc = image || placeholderSrc;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
      <img src={displaySrc} alt={`${label} preview`} className="h-48 w-full object-cover" />

   

     <button
  type="button"
  onClick={onClick}
  className="absolute bottom-3 right-3 inline-flex h-15 w-15 items-center justify-center rounded-full bg-cyan-500 shadow-lg transition hover:bg-cyan-600 hover:shadow-xl"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-8 w-8 text-white"
  >
    <path d="M4 8a2 2 0 0 1 2-2h2.2a1 1 0 0 0 .8-.4l1-1.2a1 1 0 0 1 .8-.4h2.4a1 1 0 0 1 .8.4l1 1.2a1 1 0 0 0 .8.4H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
</button>

    </div>
  );
};

const DocumentVerificationPage = () => {
  const router = useRouter();
  const placeholderFront = '/images/id_f.png';
  const placeholderBack = '/images/id_b.png';

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontCaptured, setFrontCaptured] = useState(false);
  const [backCaptured, setBackCaptured] = useState(false);
  const [activeSide, setActiveSide] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (side) => {
    setActiveSide(side);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleCapture = (dataUrl) => {
    if (activeSide === 'front') {
      setFrontImage(dataUrl);
      setFrontCaptured(true);
      try {
        sessionStorage.setItem('documentFront', dataUrl);
      } catch (err) {
        console.warn('Failed to cache document front', err);
      }
    } else if (activeSide === 'back') {
      setBackImage(dataUrl);
      setBackCaptured(true);
      try {
        sessionStorage.setItem('documentBack', dataUrl);
      } catch (err) {
        console.warn('Failed to cache document back', err);
      }
    }
  };

  const readyToUpload = frontCaptured && backCaptured;
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!readyToUpload) return;
    setIsUploading(true);

    try {
      // Get user ID from sessionStorage (set during liveness check)
      const userId = sessionStorage.getItem('livenessUserId') || `user_${Date.now()}`;
      const merchantId = '434343j4n43k4';
      const selfieUrl = sessionStorage.getItem('faceImageUrl');

      // Convert data URLs to Blobs
      const dataUrlToBlob = (dataUrl) => {
        if (!dataUrl) return null;
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: 'image/jpeg' });
      };

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('merchant_id', merchantId);
      formData.append('document_front', dataUrlToBlob(frontImage), 'id_front.jpg');
      
      if (backImage) {
        formData.append('document_back', dataUrlToBlob(backImage), 'id_back.jpg');
      }

      // Fetch the selfie as Blob if we have the URL
      let selfieBlob = null;
      if (selfieUrl) {
        const response = await fetch(selfieUrl);
        selfieBlob = await response.blob();
      }

      if (selfieBlob) {
        formData.append('selfie', selfieBlob, 'selfie.jpg');
      }

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

      // Cache KYC result
      const kycStatus = (data?.status || '').toString();
      const profileId = data?.raw_data?.profile_id || sessionStorage.getItem('livenessProfileId');
      const outputImages = data?.output_images || {};
      const warnings = data?.warnings || [];
      const rawData = data?.raw_data || {};

      try {
        sessionStorage.setItem('livenessStatus', kycStatus);
        sessionStorage.setItem('livenessProfileId', profileId);
        sessionStorage.setItem('verificationStage', 'kyc');
        // Store additional KYC data
        sessionStorage.setItem('kycOutputImages', JSON.stringify(outputImages));
        sessionStorage.setItem('kycWarnings', JSON.stringify(warnings));
        sessionStorage.setItem('kycRawData', JSON.stringify(rawData));
      } catch (storageError) {
        console.warn('Unable to cache KYC data', storageError);
      }

      // Navigate to success page
      router.push('/success');
    } catch (err) {
      console.error('Error uploading documents:', err);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-4 text-black">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-lg font-semibold text-black transition hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        
      </button>

      <div className="mx-auto max-w-3xl">
        <div className="mb-10 space-y-3 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl font-bold">Take your photo ID</h1>
          <p className="text-gray-700">Capture clear photos of the front and back of your government-issued ID. Make sure all details are readable.</p>
        </div>

        <div className="grid gap-6">
          <PlaceholderCard
            label="Front"
            image={frontImage}
            placeholderSrc={placeholderFront}
            isCaptured={frontCaptured}
            onClick={() => handleOpen('front')}
          />
          <PlaceholderCard
            label="Back"
            image={backImage}
            placeholderSrc={placeholderBack}
            isCaptured={backCaptured}
            onClick={() => handleOpen('back')}
          />
        </div>

        <button
          type="button"
          disabled={!readyToUpload || isUploading}
          onClick={handleUpload}
          className={` w-full rounded-xl px-4 py-4 mt-30 text-lg font-semibold text-white transition ${
            readyToUpload && !isUploading ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-cyan-400 cursor-not-allowed'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload documents'}
        </button>
      </div>

      <CameraModal
        open={isModalOpen}
        sideLabel={activeSide === 'front' ? 'Front' : 'Back'}
        onClose={handleClose}
        onCapture={handleCapture}
      />
    </div>
  );
};

export default DocumentVerificationPage;
