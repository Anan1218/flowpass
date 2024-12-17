'use client';

import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function PricingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    venueName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaptchaError(false);
    
    const captchaValue = recaptchaRef.current?.getValue();
    if (!captchaValue) {
      setCaptchaError(true);
      return;
    }

    setIsSubmitting(true);
    
    // Here you would typically send this data to your backend
    // For now, we'll just simulate a submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
        <p className="text-gray-400 text-lg">
          We've received your inquiry and will get back to you within 24 hours to discuss how we can help your venue maximize its revenue.
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      {/* Value Proposition Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">
          No Upfront Costs, Just More Revenue
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          We believe in growing together. You only pay when you make money - it's that simple.
        </p>
        
        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-indigo-500 text-2xl font-bold mb-2">0%</div>
            <h3 className="font-semibold mb-2">Upfront Costs</h3>
            <p className="text-gray-400">No setup fees, no monthly fees, no hidden charges</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-indigo-500 text-2xl font-bold mb-2">24/7</div>
            <h3 className="font-semibold mb-2">Support</h3>
            <p className="text-gray-400">We're here to help you succeed every step of the way</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="text-indigo-500 text-2xl font-bold mb-2">Simple</div>
            <h3 className="font-semibold mb-2">Revenue Share</h3>
            <p className="text-gray-400">Only pay a percentage of incremental revenue</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Get Started Today</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label htmlFor="venueName" className="form-label">Venue Name</label>
                <input
                  type="text"
                  id="venueName"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="form-label">Tell us about your venue</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-input min-h-[100px]"
                required
              />
            </div>

            {/* reCAPTCHA */}
            <div className="flex flex-col items-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                theme="dark"
                onChange={() => setCaptchaError(false)}
              />
              {captchaError && (
                <p className="text-red-500 text-sm mt-2">
                  Please complete the CAPTCHA
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-center font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Get Started'}
            </button>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Trusted by venues across the country</p>
          <p className="text-sm text-gray-500">
            We'll get back to you within 24 hours to discuss how we can help your venue maximize its revenue.
          </p>
        </div>
      </div>
    </div>
  );
} 