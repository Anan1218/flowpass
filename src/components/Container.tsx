export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
} 