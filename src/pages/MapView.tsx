import { BottomNavigation } from '@/components/BottomNavigation';
import { useComplaints } from '@/providers/ComplaintsProvider';
import { Navigation, Layers, MapPin as MapPinIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { IssueTagChip } from '@/components/IssueTagChip';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons based on severity
const createCustomIcon = (severity: string) => {
  const color = severity === 'High' ? '#ef4444' : severity === 'Medium' ? '#f59e0b' : '#22c55e';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Component to update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapView() {
  const { complaints } = useComplaints();
  const navigate = useNavigate();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Default center (Kathmandu, Nepal)
  const defaultCenter: [number, number] = [27.7172, 85.3240];
  const center = userLocation || defaultCenter;

  console.log('MapView rendering with', complaints.length, 'complaints');
  console.log('Center:', center);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Calculate heatmap intensity based on complaint density
  const getHeatmapRadius = (lat: number, lng: number) => {
    const nearby = complaints.filter(c => {
      const distance = Math.sqrt(
        Math.pow(c.lat - lat, 2) + Math.pow(c.lng - lng, 2)
      );
      return distance < 0.01;
    });
    return Math.min(nearby.length * 50 + 100, 500);
  };

  const getHeatmapColor = (severity: string) => {
    switch (severity) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  if (complaints.length === 0) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-slate-100">
        <header className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-12 pb-4 pointer-events-none">
          <h1 className="text-xl font-bold text-foreground bg-card/90 backdrop-blur inline-block px-4 py-2 rounded-xl shadow-md pointer-events-auto">
            Complaints Map (0)
          </h1>
        </header>

        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <MapPinIcon size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No complaints to display on map</p>
            <Button onClick={() => navigate('/report')} className="mt-4">
              Report an Issue
            </Button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-100 flex flex-col">
      <header className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-0 pb-4 pointer-events-none flex justify-center">
        <h1 className="text-xl font-bold text-foreground bg-card/90 backdrop-blur px-4 py-2 rounded-xl shadow-md pointer-events-auto">
          Complaints Map ({complaints.length})
        </h1>
      </header>

      {/* Map Container */}
      <div className="h-96 p-4 relative">
        <div className="w-full h-full rounded-lg overflow-hidden shadow-lg relative">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={true}
            style={{ height: '100%', width: '100%', background: '#f0f0f0' }}
            className="z-0 rounded-lg"
          >
            {/* OpenStreetMap Tiles - Free and reliable */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            {/* Update map center when user location changes */}
            <MapUpdater center={center} />

            {/* Render markers or heatmap */}
            {showHeatmap ? (
              // Heatmap visualization
              complaints.map((complaint) => (
                <Circle
                  key={`heat-${complaint.id}`}
                  center={[complaint.lat, complaint.lng]}
                  radius={getHeatmapRadius(complaint.lat, complaint.lng)}
                  pathOptions={{
                    fillColor: getHeatmapColor(complaint.severity),
                    fillOpacity: 0.3,
                    color: getHeatmapColor(complaint.severity),
                    opacity: 0.5,
                    weight: 2,
                  }}
                />
              ))
            ) : (
              // Individual markers
              complaints.map((complaint) => (
                <Marker
                  key={`marker-${complaint.id}`}
                  position={[complaint.lat, complaint.lng]}
                  icon={createCustomIcon(complaint.severity)}
                >
                  <Popup maxWidth={300} className="custom-popup">
                    <div className="p-2 min-w-[250px]">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <IssueTagChip type={complaint.type} />
                        <StatusBadge status={complaint.status} />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{complaint.location}</h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {complaint.description}
                      </p>
                      {complaint.photoUrl && (
                        <img
                          src={complaint.photoUrl}
                          alt="Complaint"
                          className="w-full h-32 object-cover rounded mb-2"
                          loading="lazy"
                        />
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className={`font-medium ${
                          complaint.severity === 'High' ? 'text-red-600' :
                          complaint.severity === 'Medium' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {complaint.severity} Severity
                        </span>
                        <span>{new Date(complaint.timestamp).toLocaleDateString()}</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/complaint/${complaint.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}          

            {/* User location marker */}
            {userLocation && (
              <Circle
                center={userLocation}
                radius={50}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.5,
                  color: '#3b82f6',
                  weight: 2,
                }}
              />
            )}
          </MapContainer>

          {/* Floating Control Buttons - positioned relative to map */}
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            {/* Toggle Heatmap/Markers */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
                showHeatmap ? 'bg-primary text-primary-foreground' : 'bg-card'
              }`}
              title={showHeatmap ? 'Show Markers' : 'Show Heatmap'}
            >
              <Layers size={20} />
            </motion.button>

            {/* Current Location */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={getCurrentLocation}
              className="w-12 h-12 bg-card rounded-full shadow-lg flex items-center justify-center"
              title="Go to my location"
            >
              <Navigation size={20} className="text-primary" />
            </motion.button>
          </div>

          {/* Legend - positioned relative to map */}
          <div className="absolute top-4 right-4 z-[1000] bg-card/90 backdrop-blur rounded-lg shadow-md p-3 text-xs">
            <h3 className="font-semibold mb-2">Severity</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="flex-1 bg-white overflow-y-auto p-4 border-t">
        <h2 className="text-lg font-semibold mb-4">Complaints List</h2>
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="border rounded-lg p-3 shadow-sm bg-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <IssueTagChip type={complaint.type} />
                <StatusBadge status={complaint.status} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{complaint.location}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {complaint.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className={`font-medium ${
                  complaint.severity === 'High' ? 'text-red-600' :
                  complaint.severity === 'Medium' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {complaint.severity} Severity
                </span>
                <span>{new Date(complaint.timestamp).toLocaleDateString()}</span>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() => navigate(`/complaint/${complaint.id}`)}
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
