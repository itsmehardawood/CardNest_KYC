'use client';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen px-4 py-4 text-white flex flex-col items-center justify-center relative overflow-hidden" style={{backgroundColor: '#3f0000'}}>
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        {/* Advanced loading animation */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-red-400 opacity-20 blur-xl animate-pulse"></div>

            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-red-200 animate-spin" style={{ animationDuration: '2s' }}></div>

            {/* Middle counter-rotating ring */}
            <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-red-300 border-l-white animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>

            {/* Inner animated circle */}
            <div className="absolute inset-6 rounded-full border-2 border-white/30 animate-pulse"></div>

            {/* Center checkmark icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text with gradient */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">
            Verifying Document
          </h2>
          <p className="text-red-100 text-lg font-light tracking-wide">
            Processing your ID with advanced AI technology
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="space-y-3 mt-10">
          <div className="w-full h-2 bg-red-900/30 rounded-full overflow-hidden border border-red-500/20">
            <div className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-full animate-pulse" style={{
              animation: 'slideProgress 2s ease-in-out infinite'
            }}></div>
          </div>
          <p className="text-red-200 text-sm font-semibold">Processing...</p>
        </div>

        {/* Enhanced progress steps */}
        <div className="space-y-4 mt-10 bg-red-900/20 rounded-2xl p-6 border border-red-500/20 backdrop-blur-sm">
          {/* Step 1: Upload */}
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.5 13a3 3 0 01-.369-5.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H4.5z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="text-red-100 font-semibold">Uploading Document</p>
              <p className="text-red-200 text-sm">Securely transmitting your ID</p>
            </div>
            <div className="shrink-0 animate-spin">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Step 2: Analyze */}
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400/50 to-red-500/50 text-red-200 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="text-red-100 font-semibold">Analyzing Document</p>
              <p className="text-red-200 text-sm">Running advanced verification checks</p>
            </div>
            <div className="shrink-0 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Step 3: Confirm */}
          <div className="flex items-center gap-4 group opacity-50">
            <div className="w-10 h-10 rounded-full bg-red-800 text-red-400 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="text-red-300 font-semibold">Verification Complete</p>
              <p className="text-red-400 text-sm">Proceeding to next step</p>
            </div>
          </div>
        </div>

        {/* Info message */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-8 space-y-2">
          <p className="text-red-200 text-sm font-medium">⏱️ Usually completes in 10-30 seconds</p>
          <p className="text-red-300 text-xs">Your document is secure and encrypted during transmission</p>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideProgress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
