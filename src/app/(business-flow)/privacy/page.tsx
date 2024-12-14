'use client';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
          <p>
            At ScanPass, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Phone numbers for pass delivery</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Usage data and analytics</li>
            <li>Business account information for venue operators</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Process and deliver your passes</li>
            <li>Send important notifications about your purchases</li>
            <li>Improve our services and user experience</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your 
            personal information. However, no electronic transmission over the internet or information 
            storage technology can be guaranteed to be 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Services</h2>
          <p>
            We use trusted third-party services for payment processing (Stripe) and cloud infrastructure. 
            These providers have their own privacy policies and handling procedures for personal data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to our processing of your information</li>
            <li>Withdraw consent where applicable</li>
          </ul>
        </section>
      </div>
    </div>
  );
} 