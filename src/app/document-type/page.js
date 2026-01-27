'use client';

import { useRouter } from 'next/navigation';

const DocumentTypePage = () => {
  const router = useRouter();

  const documentTypes = [
    {
      id: 'passport',
      label: 'Passport',
      description: 'International travel document',
    },
    {
      id: 'license',
      label: 'Driver License',
      description: 'Government-issued driving permit',
    },
    {
      id: 'national-id',
      label: 'National ID',
      description: 'Government-issued identification card',
    },
  ];

  const handleSelectDocument = (type) => {
    router.push(`/document-verification?type=${type}`);
  };

  return (
    <div className="flex min-h-screen flex-col" style={{backgroundColor: '#3f0000'}}>
      {/* Header */}
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="text-white hover:text-red-200 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md space-y-8">
          {/* Title Section */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Select ID Document Type
            </h1>
            <p className="text-red-100 text-lg">
              Choose the type of identification document you want to verify
            </p>
          </div>

          {/* Document Options */}
          <div className="space-y-4">
            {documentTypes.map((docType) => (
              <button
                key={docType.id}
                onClick={() => handleSelectDocument(docType.id)}
                className="w-full flex items-center justify-between rounded-xl bg-black p-5 transition-all hover:bg-gray-900 hover:shadow-lg hover:shadow-black/30 border border-gray-700 hover:border-gray-500 group"
              >
                <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-gray-800 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">
                      {docType.label}
                    </h3>
                    <p className="text-sm text-red-100">{docType.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Info Note */}
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
            <div className="flex gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-200 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-100">
                Make sure your document is valid and not expired. You'll need to
                capture clear photos in the next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTypePage;
