import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/hooks/useLocation';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const { login, continueAsGuest, setUserLocation, isAuthenticated, isLoading } = useAuth();
  const { requestLocation, loading: locationLoading } = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLocationAndNavigate = async () => {
    const success = await requestLocation();
    if (success) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      });
      toast.success('Location enabled!');
    }
    setShowLocationModal(false);
    navigate('/home');
  };

  const handleSkipLocation = () => {
    setShowLocationModal(false);
    navigate('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      setShowLocationModal(true);
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    toast.success('Continuing as guest');
    setShowLocationModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <MapPin size={32} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Report.np</h1>
          <p className="text-muted-foreground mt-2">Report issues. Improve Nepal.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-primary font-medium"
          >
            Forgot Password?
          </button>
          <button type="submit" disabled={loading} className="btn-primary mt-6">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </motion.form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <button
          onClick={handleGuestMode}
          className="w-full py-4 rounded-2xl border-2 border-border text-foreground font-semibold hover:bg-muted/50 transition-colors"
        >
          Continue as Guest
        </button>

        <p className="text-center mt-8 text-muted-foreground">
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="text-primary font-medium">
            Create Account
          </button>
        </p>
      </div>

      <LocationPermissionModal
        isOpen={showLocationModal}
        onAllow={handleLocationAndNavigate}
        onSkip={handleSkipLocation}
        loading={locationLoading}
      />
    </div>
  );
}
