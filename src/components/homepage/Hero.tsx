import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12 py-20">
      <div className="flex-1 space-y-6">
        <h1 className="text-6xl font-bold">
          ScanPass
        </h1>
        <p className="text-xl text-gray-300">
          Setup a FastPass for your establishment. Maximize your revenue with{' '}
          <span className="text-indigo-400">no sign up fee</span> and{' '}
          <span className="text-indigo-400">no subscriptions</span>.
          See how we helped make over $20,000 for our clients.
        </p>
        <Link 
          href="/signin" 
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium"
        >
          Join Now
        </Link>
      </div>
      
      <div className="flex-1 flex justify-center">
        <div className="relative rounded-lg overflow-hidden">
          <Image 
            src="/homepage/image1.png"
            alt="Demo"
            width={400}
            height={800}
            className="h-auto object-contain rounded-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
} 