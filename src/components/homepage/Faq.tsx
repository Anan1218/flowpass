"use client";
import { useState } from 'react';

const faqItems = [
  {
    question: "How does the ScanPass system work?",
    answer: "Our ScanPass system allows you to skip regular lines at attractions by reserving specific time slots. Simply select your desired attraction and preferred time, and you'll receive a designated return window."
  },
  {
    question: "How many ScanPasses can I hold at once?",
    answer: "You can hold up to 3 ScanPasses at a time. Once you use your first ScanPass, you can book another one, allowing you to continuously maximize your experience throughout the day."
  },
  {
    question: "Can I modify my ScanPass reservations?",
    answer: "Yes, you can modify or cancel your ScanPass reservations through our mobile app or website, subject to availability. Changes can be made up until your scheduled time slot."
  },
  {
    question: "Are ScanPasses included with my ticket?",
    answer: "Yes, ScanPasses are included with all standard admission tickets at no additional cost. Premium pass holders may receive additional ScanPass benefits."
  },
  {
    question: "What happens if I miss my ScanPass time window?",
    answer: "ScanPass return windows have a one-hour duration. If you miss your scheduled time window, your ScanPass will expire and you'll need to make a new reservation."
  }
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {faqItems.map((item, index) => (
        <div key={index} className="w-full">
          <button
            onClick={() => toggleFaq(index)}
            className="w-full bg-white bg-opacity-5 p-4 rounded-lg text-left hover:bg-opacity-10 transition-all flex justify-between items-center"
          >
            <span>{item.question}</span>
            <span className="text-xl">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          {openIndex === index && (
            <div className="p-4 bg-white bg-opacity-5 mt-1 rounded-lg">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 