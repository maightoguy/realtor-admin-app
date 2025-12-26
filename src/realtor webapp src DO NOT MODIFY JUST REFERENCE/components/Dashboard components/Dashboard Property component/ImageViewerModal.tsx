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
            className="absolute left-20 top-150 md:left-40  md:top-1/2 -translate-y-1/2 w-7 h-7 bg-neutral-500 rounded-full flex items-center justify-center shadow-lg hover:bg-white active:bg-gray-50 transition-colors z-100"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-20 top-150 md:right-40  md:top-1/2 -translate-y-1/2 w-7 h-7 bg-neutral-500 rounded-full flex items-center justify-center shadow-lg hover:bg-white active:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </>
      )}
      <div className="absolute top-53 right-1 md:top-18 md:right-50 z-10">
        <button
          onClick={onClose}
          className="w-7 h-7 bg-neutral-500 rounded-lg flex items-center justify-center shadow-lg hover:bg-gray-50 active:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>
      </div>
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] rounded-2xl overflow-hidden">
        {/* Header */}

        {/* Main Image Container */}
        <div className="relative">
          {/* Main Image */}
          <div className="relative h-64 sm:h-80 lg:h-96">
            <img
              src={images[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
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

