import Link from 'next/link';

export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 py-20">
      <div className="flex-1 space-y-6">
        <h1 className="text-6xl font-bold">
          ScanPass
        </h1>
        <p className="text-xl text-gray-300">
          Bring your words to life with AI-generated celebrity videos! Just submit your prompt and receive{' '}
          <span className="text-indigo-400">voice cloned</span> +{' '}
          <span className="text-indigo-400">lipsynced</span> videos.
        </p>
        <Link 
          href="/signin" 
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium"
        >
          Get Started Now
        </Link>
      </div>
      
      <div className="flex-1">
        <div className="relative rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-800 rounded-lg">
            {/* Add your video player here */}
          </div>
          <p className="text-sm text-center mt-2">Turn Sound On!</p>
        </div>
      </div>
    </div>
  );
} 