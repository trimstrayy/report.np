import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/hooks/useLocation';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { toast } from 'sonner';

type AccountType = 'reporter' | 'municipal';

export default function Signup() {
  const [accountType, setAccountType] = useState<AccountType>('reporter');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [municipalName, setMunicipalName] = useState('');
  const [municipalAddress, setMunicipalAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const { signup, setUserLocation } = useAuth();
  const { requestLocation, loading: locationLoading } = useLocation();

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
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (accountType === 'municipal' && (!municipalName || !municipalAddress)) {
      toast.error('Please fill in all municipal details');
      return;
    }

    setLoading(true);
    const result = await signup({
      fullName: name,
      email,
      phone,
      password,
      accountType,
      municipalName: accountType === 'municipal' ? municipalName : undefined,
      municipalAddress: accountType === 'municipal' ? municipalAddress : undefined,
    });
    setLoading(false);

    if (result.success) {
      if (accountType === 'municipal') {
        toast.success('Account created! Your municipal account is pending approval from an existing municipal body.');
        navigate('/login');
      } else {
        toast.success('Account created!');
        setShowLocationModal(true);
      }
    } else {
      toast.error(result.error || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-xl">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Create Account</h1>
      </header>

      {/* Account Type Toggle */}
      <div className="px-6 mb-6">
        <p className="text-sm text-muted-foreground mb-3">Select account type</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAccountType('reporter')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${
              accountType === 'reporter'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground'
            }`}
          >
            <User size={20} />
            <span className="font-medium">Reporter</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('municipal')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${
              accountType === 'municipal'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground'
            }`}
          >
            <Building2 size={20} />
            <span className="font-medium">Municipal</span>
          </button>
        </div>
        {accountType === 'municipal' && (
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-3 rounded-xl">
            ⚠️ Municipal accounts require approval from an existing municipal body before you can log in.
          </p>
        )}
      </div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="px-6 space-y-4"
      >
        <input
          type="text"
          placeholder={accountType === 'municipal' ? 'Representative Name' : 'Full Name'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
          required
        />

        {accountType === 'municipal' && (
          <>
            <input
              type="text"
              placeholder="Municipal Body Name (e.g., Kathmandu Metropolitan City)"
              value={municipalName}
              onChange={(e) => setMunicipalName(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Municipal Office Address"
              value={municipalAddress}
              onChange={(e) => setMunicipalAddress(e.target.value)}
              className="input-field"
              required
            />
          </>
        )}

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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
          required
        />

        <button type="submit" disabled={loading} className="btn-primary mt-6">
          {loading ? 'Creating...' : accountType === 'municipal' ? 'Submit for Approval' : 'Sign Up'}
        </button>
      </motion.form>

      <LocationPermissionModal
        isOpen={showLocationModal}
        onAllow={handleLocationAndNavigate}
        onSkip={handleSkipLocation}
        loading={locationLoading}
      />
    </div>
  );
}
