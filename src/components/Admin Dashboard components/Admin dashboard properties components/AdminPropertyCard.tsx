import { MapPin } from "lucide-react";
import { SoldOutIcon } from "../../icons";

interface AdminPropertyCardProps {
  image: string;
  title: string;
  price: string | number;
  location: string;
  isSoldOut?: boolean;
  description?: string;
  onViewDetails?: () => void;
}

const AdminPropertyCard = ({
  image,
  title,
  price,
  location,
  isSoldOut = false,
  description,
  onViewDetails,
}: AdminPropertyCardProps) => {
  const formattedPrice =
    typeof price === "number"
      ? `₦${price.toLocaleString()}`
      : price.startsWith("₦")
      ? price
      : `₦${price}`;

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm transition hover:shadow-md">
      {/* Image Section */}
      <div className="relative h-52 w-full">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {/* Sold Out Tag */}
        {isSoldOut && (
          <div className="flex flex-row absolute bottom-3 left-3 bg-black/60 text-rose-400 text-xs font-semibold px-3 py-1 rounded-lg">
            <SoldOutIcon color="#EF4444" className="w-5 h-5" />
            Sold out
          </div>
        )}
      </div>

      {/* Text Section */}
      <div className="p-4">
        <p className="text-[#5E17EB] font-bold text-lg mb-2">
          {formattedPrice}
        </p>
        <h3 className="font-semibold text-gray-900 text-base mb-2">{title}</h3>
        <div className="flex flex-row gap-1">
          <MapPin className="w-4 h-4 shrink-0" />
          <p className=" text-gray-500 text-sm mb-2 truncate min-w-0">
            <span>{location}</span>
          </p>
        </div>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {description ||
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempus aliquet duis integer porta. Volutpat integer ultricies diam consequat eget."}
        </p>
        <button
          onClick={onViewDetails}
          className="text-[#5E17EB] font-semibold text-sm hover:underline"
        >
          View details →
        </button>
      </div>
    </div>
  );
};

export default AdminPropertyCard;
