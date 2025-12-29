interface LoaderProps {
  text?: string;
  isOpen?: boolean;
}

export default function Loader({
  text = "Loading...",
  isOpen = true,
}: LoaderProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full bg-black/10 backdrop-blur-md flex items-center justify-center z-9999"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-xl">
        <svg
          className="animate-spin h-6 w-6 text-[#6500AC]"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-gray-700 font-medium">{text}</span>
      </div>
    </div>
  );
}
