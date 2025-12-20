import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, MapPin, Megaphone, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useComplaints } from '@/providers/ComplaintsProvider';
import { BottomNavigation } from '@/components/BottomNavigation';
import { IssueTagChip } from '@/components/IssueTagChip';
import { StatusBadge } from '@/components/StatusBadge';

interface Notice {
  id: string;
  title: string;
  body: string;
  from: string;
  timestamp: string;
  type: 'info' | 'warning' | 'alert';
}

// Dummy notices from municipal bodies (will be from backend later)
const dummyNotices: Notice[] = [
  {
    id: '1',
    title: 'Scheduled Water Supply Disruption',
    body: 'Water supply will be disrupted in Ward 10 on Dec 20th from 9 AM - 5 PM due to maintenance.',
    from: 'Kathmandu Metropolitan City',
    timestamp: '2025-12-17T08:00:00',
    type: 'warning',
  },
  {
    id: '2',
    title: 'Road Construction Notice',
    body: 'Ring Road section near Kalanki will be under construction. Please use alternate routes.',
    from: 'Department of Roads',
    timestamp: '2025-12-16T14:30:00',
    type: 'info',
  },
];

// Calculate distance between two coordinates (Haversine formula)
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<'nearby' | 'notices'>('nearby');
  const navigate = useNavigate();
  const { userLocation } = useAuth();
  const { complaints } = useComplaints();

  // Filter complaints within 5km radius
  const nearbyComplaints = userLocation
    ? complaints.filter(c => {
        const distance = getDistanceKm(userLocation.latitude, userLocation.longitude, c.lat, c.lng);
        return distance <= 5;
      }).map(c => ({
        ...c,
        distance: getDistanceKm(userLocation.latitude, userLocation.longitude, c.lat, c.lng),
      })).sort((a, b) => a.distance - b.distance)
    : [];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const noticeTypeStyles = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    alert: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
  };

  const noticeTypeIcons = {
    info: <Megaphone className="text-blue-600" size={20} />,
    warning: <AlertTriangle className="text-amber-600" size={20} />,
    alert: <Bell className="text-red-600" size={20} />,
  };

  return (
    <div className="page-container">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-xl">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Notifications</h1>
      </header>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 p-1 bg-muted rounded-2xl">
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'nearby'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Nearby Issues
          </button>
          <button
            onClick={() => setActiveTab('notices')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'notices'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Official Notices
          </button>
        </div>
      </div>

      <section className="px-5 pb-24 space-y-3">
        {activeTab === 'nearby' ? (
          <>
            {!userLocation ? (
              <div className="card-elevated p-8 text-center">
                <MapPin size={40} className="mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2">Location Required</h3>
                <p className="text-sm text-muted-foreground">
                  Enable location to see issues reported near you.
                </p>
              </div>
            ) : nearbyComplaints.length === 0 ? (
              <div className="card-elevated p-8 text-center">
                <Bell size={40} className="mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2">No Nearby Issues</h3>
                <p className="text-sm text-muted-foreground">
                  There are no reported issues within 5km of your location.
                </p>
              </div>
            ) : (
              nearbyComplaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/complaint/${complaint.id}`)}
                  className="card-elevated p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={complaint.photoUrl}
                        alt={complaint.type}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <IssueTagChip type={complaint.type} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {complaint.distance.toFixed(1)} km away
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 mb-1">
                        {complaint.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <StatusBadge status={complaint.status} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {formatTime(complaint.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        ) : (
          <>
            {dummyNotices.length === 0 ? (
              <div className="card-elevated p-8 text-center">
                <Megaphone size={40} className="mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-2">No Notices</h3>
                <p className="text-sm text-muted-foreground">
                  There are no official notices at this time.
                </p>
              </div>
            ) : (
              dummyNotices.map((notice, index) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-2xl border ${noticeTypeStyles[notice.type]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-background">
                      {noticeTypeIcons[notice.type]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{notice.body}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary">{notice.from}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(notice.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <p className="text-xs text-center text-muted-foreground pt-4">
              Municipal body accounts coming soon
            </p>
          </>
        )}
      </section>

      <BottomNavigation />
    </div>
  );
}
