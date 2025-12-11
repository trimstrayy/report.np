import { BottomNavigation } from '@/components/BottomNavigation';
import { useComplaints } from '@/providers/ComplaintsProvider';
import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MapView() {
  const { complaints } = useComplaints();

  return (
    <div className="page-container pb-0">
      <header className="absolute top-0 left-0 right-0 z-10 px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-foreground bg-card/80 backdrop-blur inline-block px-4 py-2 rounded-xl">Complaints Map</h1>
      </header>

      {/* Map Placeholder */}
      <div className="h-screen bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center relative">
        <div className="text-center px-6">
          <MapPin size={64} className="mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Map integration requires Mapbox API key</p>
          <p className="text-sm text-muted-foreground mt-2">{complaints.length} complaints to display</p>
        </div>

        {/* Floating GPS Button */}
        <motion.button whileTap={{ scale: 0.9 }} className="absolute bottom-28 right-4 w-12 h-12 bg-card rounded-full shadow-lg flex items-center justify-center">
          <Navigation size={20} className="text-primary" />
        </motion.button>
      </div>

      <BottomNavigation />
    </div>
  );
}
