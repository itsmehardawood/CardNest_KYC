'use client';
import { useRouter } from 'next/navigation';

const SuccessPage = () => {
  const router = useRouter();

  const handleDone = () => {
    router.push('/document-verification');
  };

  return (
    <div className="flex flex-col items-center  h-screen bg-slate-800">
      <div className="w-12 h-12 mt-10 rounded-full bg-cyan-500 flex items-center justify-center">
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
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>
      <h1 className="text-cyan-600 text-3xl mt-4">Successful!</h1>
      <p className="text-gray-400 mt-2 text-xl mb-15">ID Confirmation, You May Enter</p>
      <div className="w-50 h-50 rounded-full border-4 border-cyan-500 bg-gray-600 flex items-center justify-center mt-4">
        <span className="text-white text-4xl font-bold"></span>
      </div>
      <p className="text-cyan-600 text-5xl my-8 font-semibold ">Dawood Ayub</p>
      <p className="text-cyan-600 text-xl">Employee ID: <span className='text-gray-400'> S221-2121</span></p>
      <p className="text-cyan-600 text-xl">Department: <span className='text-gray-400'>Software Engineering</span></p>
      <p className="text-gray-400 text-2xl mt-20">Thank you and have a good day!</p>
      <button 
        onClick={handleDone}
        className="bg-cyan-600 text-white mt-6 px-6 py-2 rounded hover:bg-cyan-500 transition-colors"
      >
        Proceed
      </button>
    </div>
  );
};

export default SuccessPage;
