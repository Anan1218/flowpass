interface SectionTitleProps {
  preTitle?: string;
  title: string;
  children?: React.ReactNode;
}

export function SectionTitle({ preTitle, title, children }: SectionTitleProps) {
  return (
    <div className="text-center py-20">
      {preTitle && (
        <p className="text-indigo-400 uppercase tracking-wide mb-4">
          {preTitle}
        </p>
      )}
      <h2 className="text-4xl font-bold mb-4">{title}</h2>
      {children && <p className="text-gray-300 mb-8">{children}</p>}
    </div>
  );
} 