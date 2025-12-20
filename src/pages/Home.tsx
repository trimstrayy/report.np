import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Phone, Filter, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useComplaints } from '@/providers/ComplaintsProvider';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ComplaintCard } from '@/components/ComplaintCard';
import { FilterSheet } from '@/components/FilterSheet';

export default function Home() {
  const { user } = useAuth();
  const { filteredComplaints, filters, setFilters } = useComplaints();
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    { icon: AlertTriangle, label: 'Report Issue', color: 'bg-primary', onClick: () => navigate('/report') },
    { icon: MapPin, label: 'View Map', color: 'bg-blue-500', onClick: () => navigate('/map') },
    { icon: Phone, label: 'Helplines', color: 'bg-green-500', onClick: () => navigate('/helplines') },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{user?.name || 'Guest'}</h1>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative p-2 bg-primary-foreground/10 rounded-xl">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3 mt-4">
          {quickActions.map((action, i) => (
            <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={action.onClick} className="flex-1 flex flex-col items-center gap-2 py-4 bg-primary-foreground/10 rounded-2xl">
              <action.icon size={24} />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </header>

      {/* Feed Section */}
      <section className="px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Reports</h2>
          <button onClick={() => setShowFilters(true)} className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-muted-foreground">
            <Filter size={16} />
            Filter
          </button>
        </div>
        
        <div className="space-y-4">
          {filteredComplaints.map((complaint, index) => (
            <ComplaintCard key={complaint.id} complaint={complaint} index={index} />
          ))}
        </div>
      </section>

      <FilterSheet isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} onApply={setFilters} />
      <BottomNavigation />
    </div>
  );
}
