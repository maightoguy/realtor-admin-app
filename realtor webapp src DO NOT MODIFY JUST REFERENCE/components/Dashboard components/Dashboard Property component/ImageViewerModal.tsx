import { useState, useEffect, type FC, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

const ImageViewerModal: FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Use useCallback for prop functions if they are defined inside the parent component.
  // Although not strictly necessary here, it's good practice.
  // const memoizedOnClose = useCallback(onClose, [onClose]); // If you were using it.

  // 1. Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // 2. Navigation logic is better placed here if not needed elsewhere
  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // 3. Handle keyboard navigation - NOW WITH CORRECT DEPENDENCIES
  useEffect(() => {
    // Only set up the handler if the modal is open
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevImage(); // Dependency
          break;
        case "ArrowRight":
          e.preventDefault();
          nextImage(); // Dependency
          break;
        case "Escape":
          e.preventDefault();
          onClose(); // Dependency
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    onClose, // MUST BE INCLUDED: A function passed as a prop
    prevImage, // MUST BE INCLUDED: A stable memoized function
    nextImage, // MUST BE INCLUDED: A stable memoized function
  ]);

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isOpen || images.length === 0) return null;

  // ... (rest of the return JSX remains the same)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 md:left-4 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors z-20"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 md:right-4 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors z-20"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
        </>
      )}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onClose}
          className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
      </div>
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] rounded-2xl overflow-hidden bg-black">
        {/* Header */}

        {/* Main Image Container */}
        <div className="relative flex items-center justify-center bg-black">
          {/* Main Image */}
          <div className="relative w-full h-64 md:h-96 lg:h-[32rem]">
            <img
              src={images[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs md:text-sm px-3 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="p-4 bg-transparent">
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all${
                    index === currentIndex
                      ? "ring-2 ring-[#c0b0e0] scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewerModal;

