import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons not showing up
// Due to webpack not knowing how to resolve the icon path
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapViewerProps {
  locationName: string;
  // You would typically use actual coordinates (latitude, longitude)
  // For this example, we'll use a placeholder for "City of David, Lagos"
  defaultCenter: [number, number];
}

// Component to update map view when center changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
    // Invalidate size to ensure tiles load properly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, map]);

  return null;
}

const MapViewer: React.FC<MapViewerProps> = ({
  locationName,
  defaultCenter,
}) => {
  // The default zoom level
  const zoom = 13;

  return (
    <div className="w-full h-full rounded-lg" style={{ minHeight: "256px" }}>
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full rounded-lg z-0" // Ensure z-index is lower than notifications (usually z-50)
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        key={`${defaultCenter[0]}-${defaultCenter[1]}`}
      >
        {/* OpenStreetMap tile layer (the actual map image) */}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker at the location */}
        <Marker position={defaultCenter}>
          <Popup>{locationName}</Popup>
        </Marker>

        {/* Update map when center changes */}
        <MapUpdater center={defaultCenter} />
      </MapContainer>
    </div>
  );
};

export default MapViewer;
