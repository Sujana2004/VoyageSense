import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap = ({ place, height = "400px" }) => {
  // Default coordinates (Delhi) if none provided
  const defaultLat = 28.6139;
  const defaultLon = 77.2090;
  
  const latitude = place?.lat || defaultLat;
  const longitude = place?.lon || defaultLon;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300">
      {place?.lat && place?.lon ? (
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          style={{ height: height, width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>
              <div className="text-center">
                <strong className="text-lg">{place.name}</strong>
                <br />
                <span className="text-gray-600">
                  {place.city}, {place.country}
                </span>
                <br />
                <span className="text-sm text-blue-600">
                  {place.category}
                </span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div 
          className="w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400 text-white"
          style={{ height: height }}
        >
          <div className="text-center">
            <span className="text-6xl mb-4">🗺️</span>
            <p className="text-xl font-semibold">Location data not available</p>
            <p className="text-sm opacity-80 mt-2">Coordinates missing for this place</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;