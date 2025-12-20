import { motion } from 'framer-motion';
import { LogOut, Award, FileText, CheckCircle, ChevronRight, Globe, UserPlus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function Profile() {
  const { user, logout, isGuest, userLocation } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const rankColors = { Bronze: 'text-amber-600', Silver: 'text-gray-400', Gold: 'text-yellow-500' };

  return (
    <div className="page-container">
      <header className="bg-primary text-primary-foreground px-5 pt-12 pb-8 rounded-b-3xl text-center">
        <div className="w-20 h-20 rounded-full bg-primary-foreground/20 mx-auto mb-4 overflow-hidden flex items-center justify-center">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
              {isGuest ? '?' : user?.name?.charAt(0)}
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold">{user?.name}</h1>
        {isGuest ? (
          <p className="text-sm text-primary-foreground/70 mt-1">Sign in to track your contributions</p>
        ) : (
          <div className="flex items-center justify-center gap-1 mt-1">
            <Award size={16} className={rankColors[user?.rank || 'Bronze']} />
            <span className="text-sm">{user?.rank} Contributor</span>
          </div>
        )}
        {userLocation && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary-foreground/70">
            <MapPin size={12} />
            <span>{userLocation.latitude.toFixed(4)}°N, {userLocation.longitude.toFixed(4)}°E</span>
          </div>
        )}
      </header>

      <section className="px-5 py-6">
        {isGuest ? (
          <div className="card-elevated p-6 text-center mb-6">
            <UserPlus size={40} className="mx-auto text-primary mb-3" />
            <h3 className="font-semibold mb-2">Create an Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign up to earn points, track your reports, and become a community contributor.
            </p>
            <button onClick={() => navigate('/signup')} className="btn-primary w-full">
              Sign Up Now
            </button>
            <button onClick={() => navigate('/')} className="w-full py-3 text-primary font-medium mt-2">
              Already have an account? Login
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card-elevated p-4 text-center">
              <p className="text-2xl font-bold text-primary">{user?.points || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{user?.reportsCount || 0}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{user?.resolvedCount || 0}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        )}

        <h2 className="section-title">Settings</h2>
        <div className="card-elevated divide-y divide-border">
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3"><Globe size={20} className="text-muted-foreground" /><span>Language</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><span className="text-sm">English</span><ChevronRight size={18} /></div>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-destructive">
            <LogOut size={20} /><span>{isGuest ? 'Exit Guest Mode' : 'Logout'}</span>
          </button>
        </div>
      </section>

      <BottomNavigation />
    </div>
  );
}
