const faqItems = [
  {
    question: "Is it legal to create videos of real people using AI?",
    answer: "Your answer here..."
  },
  {
    question: "How long can the generated videos be?",
    answer: "Your answer here..."
  },
  {
    question: "Can I use the generated videos for commercial purposes?",
    answer: "Your answer here..."
  },
  {
    question: "How accurate is the lip-syncing in the generated videos?",
    answer: "Your answer here..."
  },
  {
    question: "Are the generated videos watermarked?",
    answer: "Your answer here..."
  }
];

export function Faq() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {faqItems.map((item, index) => (
        <button
          key={index}
          className="w-full bg-white bg-opacity-5 p-4 rounded-lg text-left hover:bg-opacity-10 transition-all"
        >
          {item.question}
        </button>
      ))}
    </div>
  );
} 