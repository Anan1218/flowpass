import Link from 'next/link';

export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 py-20">
      <div className="flex-1 space-y-6">
        <h1 className="text-6xl font-bold">
          ScanPass
        </h1>
        <p className="text-xl text-gray-300">
          Skip the lines and maximize your experience! Get instant access to your favorite attractions with{' '}
          <span className="text-indigo-400">digital reservations</span> and{' '}
          <span className="text-indigo-400">real-time availability</span>.
        </p>
        <Link 
          href="/signin" 
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium"
        >
          Reserve Now
        </Link>
      </div>
      
      <div className="flex-1">
        <div className="relative rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-800 rounded-lg">
            {/* Add your video player here */}
          </div>
          <p className="text-sm text-center mt-2">See how it works!</p>
        </div>
      </div>
    </div>
  );
} 