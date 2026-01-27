"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";

const CameraModal = ({ open, sideLabel, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const start = async () => {
      if (!open) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera access denied", error);
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
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCapture(dataUrl);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{backgroundColor: '#3f0000'}}>
      <div className="flex items-start justify-between p-3 sm:p-4">
        <button
          type="button"
          onClick={onClose}
          className="text-sm sm:text-md font-semibold text-white transition hover:text-red-200"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 flex-col mx-auto items-center px-3 sm:px-4">
        <div className="mb-3 sm:mb-4 text-center mt-4 sm:mt-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
            Take Photo of Your ID
          </h2>
          <p className="text-red-100 text-sm sm:text-base mt-1 sm:mt-2 px-2">
            Keep your ID steady and ensure all details are visible. Please wait
            for the camera to adjust.
          </p>
        </div>

        <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-red-600 bg-red-900/20 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-64 sm:h-80 md:h-96 w-full object-cover"
          />

          {/* Transparent ID card placeholder overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-4/5 h-3/5">
              {/* Dark overlay around the ID area */}
              <div className="absolute inset-0 border-4 border-dashed border-white rounded-lg bg-transparent opacity-80"></div>

              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={handleCapture}
          className="w-full rounded-xl bg-black px-4 py-3 text-lg font-semibold text-white transition hover:bg-gray-900 border border-gray-600"
        >
          Capture &amp; confirm
        </button>
      </div>
    </div>
  );
};

const PlaceholderCard = ({
  label,
  image,
  placeholderSrc,
  isCaptured,
  onClick,
}) => {
  const displaySrc = image || placeholderSrc;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-gray-600 bg-black">
      <img
        src={displaySrc}
        alt={`${label} preview`}
        className={`h-56 w-full object-cover ${isCaptured ? 'scale-125' : ''}`}
      />

      <button
        type="button"
        onClick={onClick}
        className="absolute bottom-3 right-3 inline-flex h-15 w-15 items-center justify-center rounded-full bg-black shadow-lg transition hover:bg-gray-900 hover:shadow-xl border border-gray-600"
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
  const searchParams = useSearchParams();
  const documentType = searchParams.get("type") || "license"; // default to license

  // Passport only needs front, others need both sides
  const requiresBackSide = documentType !== "passport";

  const placeholderFront = "/images/id_f.png";
  const placeholderBack = "/images/id_b.png";

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
    if (activeSide === "front") {
      setFrontImage(dataUrl);
      setFrontCaptured(true);
      try {
        sessionStorage.setItem("documentFront", dataUrl);
      } catch (err) {
        console.warn("Failed to cache document front", err);
      }
    } else if (activeSide === "back") {
      setBackImage(dataUrl);
      setBackCaptured(true);
      try {
        sessionStorage.setItem("documentBack", dataUrl);
      } catch (err) {
        console.warn("Failed to cache document back", err);
      }
    }
  };

  // Ready to upload when front is captured AND (back is captured if required)
  const readyToUpload = frontCaptured && (!requiresBackSide || backCaptured);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!readyToUpload) return;
    setIsUploading(true);

    try {
      // Generate user ID for this session
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const merchantId = "434343j4n43k4";

      // Map URL document type to API document type
      const documentTypeMap = {
        'passport': 'passport',
        'license': 'driving_license',
        'national-id': 'national_id'
      };
      const apiDocumentType = documentTypeMap[documentType] || 'driving_license';

      // Convert data URLs to Blobs
      const dataUrlToBlob = (dataUrl) => {
        if (!dataUrl) return null;
        const byteString = atob(dataUrl.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: "image/jpeg" });
      };

      const frontBlob = dataUrlToBlob(frontImage);
      const backBlob = backImage ? dataUrlToBlob(backImage) : null;

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("merchant_id", merchantId);
      formData.append("document_type", apiDocumentType);
      formData.append("document_front", frontBlob, "id_front.jpg");

      if (backBlob) {
        formData.append("document_back", backBlob, "id_back.jpg");
      }
      
      // Add selfie as empty (optional field per Swagger docs)
      // Selfie will be captured in the liveness check later
      formData.append("selfie", new Blob([]), "");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kyc/verify`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`KYC API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Log full API response for debugging
      // console.log('=== VERIFY API FULL RESPONSE ===' );
      // console.log(JSON.stringify(data, null, 2));
      // console.log('================================');

      // Cache document verification result
      const docStatus = (data?.status || "").toString();
      const profileId = data?.raw_data?.profile_id || "";
      const outputImages = data?.output_images || {};
      const warnings = data?.warnings || [];
      const rawData = data?.raw_data || {};

      try {
        sessionStorage.setItem("livenessStatus", docStatus);
        sessionStorage.setItem("livenessProfileId", profileId);
        sessionStorage.setItem("livenessUserId", userId);
        sessionStorage.setItem("verificationStage", "document");
        // Store additional document data
        sessionStorage.setItem("kycOutputImages", JSON.stringify(outputImages));
        sessionStorage.setItem("kycWarnings", JSON.stringify(warnings));
        sessionStorage.setItem("kycRawData", JSON.stringify(rawData));
      } catch (storageError) {
        // Storage error - continue anyway
      }

      // Navigate to success page (will then proceed to liveness)
      router.push("/success");
    } catch (err) {
      alert("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Render loading screen during upload
  if (isUploading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen px-4 py-4 text-white" style={{backgroundColor: '#3f0000'}}>
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 text-lg font-semibold text-white transition hover:text-red-200"
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
          <p className="text-red-100">
            {documentType === "passport"
              ? "Capture a clear photo of your passport (front page only)."
              : `Capture clear photos of both sides of your ${documentType === "license" ? "driver license" : "national ID"}.`}
          </p>
        </div>

        <div className="grid gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Front (Required)</p>

            <PlaceholderCard
              label="Front"
              image={frontImage}
              placeholderSrc={placeholderFront}
              isCaptured={frontCaptured}
              onClick={() => handleOpen("front")}
            />
          </div>

          {requiresBackSide && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Back (Required)</p>
              <PlaceholderCard 
                label="Back"
                image={backImage}
                placeholderSrc={placeholderBack}
                isCaptured={backCaptured}
                onClick={() => handleOpen("back")}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!readyToUpload || isUploading}
          onClick={handleUpload}
          className={` w-full rounded-xl px-4 py-4 mt-25 text-lg font-semibold text-white transition ${
            readyToUpload && !isUploading
              ? "bg-black hover:bg-gray-900 border border-gray-600"
              : "bg-gray-700 cursor-not-allowed border border-gray-600"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload documents"}
        </button>
      </div>

      <CameraModal
        open={isModalOpen}
        sideLabel={activeSide === "front" ? "Front" : "Back"}
        onClose={handleClose}
        onCapture={handleCapture}
      />
    </div>
  );
};

function DocumentVerificationPageWrapper() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DocumentVerificationPage />
    </Suspense>
  );
}

export default DocumentVerificationPageWrapper;
