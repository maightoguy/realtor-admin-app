import { type FC } from "react";
import { Heart, MapPin } from "lucide-react";
import type { Property } from "../../../modules/Properties";
import SoldOutIcon from "../../icons/SoldOutIcon";

interface PropertyCardProps {
  image: string;
  title: string;
  price: string | number;
  location: string;
  commission: string;
  description?: string | null;
  status?: string | null;
  type: string;
  images: string[];
  isFavorited?: boolean;
  onFavorite?: (property: Property) => void;
  onViewDetails?: (property: Property) => void;
  onClickImage?: () => void;
}

const PropertyCard: FC<PropertyCardProps & { id: string }> = ({
  id, // 👈 Capture the ID
  image,
  title,
  price,
  location,
  commission,
  description,
  status,
  type,
  images,
  isFavorited = false,
  onFavorite,
  onViewDetails,
}) => {
  const isSoldOut = (status ?? "").toLowerCase() === "sold";

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    const propertyData: Property = {
      id,
      title,
      price: String(price), // ✅ make it always string,
      image,
      location,
      commission,
      description: description ?? null,
      status: status ?? null,
      type,
      images,
    };
    if (onFavorite) onFavorite(propertyData);
  };

  const handleViewDetails = () => {
    // 👈 PASS THE FULL PROPERTY OBJECT INCLUDING 'id'
    const propertyData: Property = {
      id,
      title,
      price: String(price), // ✅ make it always string,
      image,
      location,
      commission,
      description: description ?? null,
      status: status ?? null,
      type,
      images,
    };
    if (onViewDetails) onViewDetails(propertyData);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow-sm transition hover:shadow-md cursor-pointer"
      onClick={handleViewDetails}
    >
      {/* Image Section */}
      <div className="relative h-52 w-full">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {isSoldOut && (
          <div className="flex flex-row absolute top-3 left-1 bg-gray-700/50 backdrop-blur rounded-md p-1">
            <SoldOutIcon color="#DC2626" className="w-4 h-4" />
            <p className="text-[#DC2626] text-xs font-bold">Sold out</p>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 rounded-lg p-1.5 transition ${
            isFavorited ? "bg-[#5E17EB]" : "bg-black/50 backdrop-blur-md"
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${
              isFavorited ? "fill-white text-white" : "text-white"
            }`}
          />
        </button>

        {/* Commission */}
        <div className="absolute bottom-3 right-1 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-md">
          {commission}
        </div>
      </div>

      {/* Text Section */}
      <div className="p-4">
        <p className="text-[#6D00C2] font-bold text-lg">
          {typeof price === "number" ? price.toLocaleString() : price}
        </p>

        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        <p className="text-gray-500 text-sm mt-1">
          <span className="flex items-center space-x-1 min-w-0">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{location}</span>
          </span>
        </p>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2 overflow-hidden break-words">
          {description ?? ""}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
          className="text-[#6D00C2] font-semibold text-sm mt-3 inline-block hover:underline"
        >
          View details →
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
