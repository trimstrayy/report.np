import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IssueType, Severity } from '@/models/types';
import { IssueTagChip } from '@/components/IssueTagChip';
import { PhotoPreview } from '@/components/PhotoPreview';
import { useComplaints } from '@/providers/ComplaintsProvider';
import { useAuth } from '@/providers/AuthProvider';
import { BottomNavigation } from '@/components/BottomNavigation';
import { toast } from 'sonner';

const issueTypes: IssueType[] = ['Road Damage', 'Streetlight Problem', 'Water Leakage', 'Sewage', 'Noise', 'Crime', 'Accident', 'Pollution'];
const severities: Severity[] = ['Low', 'Medium', 'High'];

export default function Report() {
  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !description) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      addComplaint({
        type: selectedType,
        description,
        lat: 27.7172,
        lng: 85.324,
        photoUrl: photo || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
        severity,
        user: user?.name || 'Anonymous',
        userAvatar: user?.avatar,
        timestamp: new Date().toISOString(),
        location: 'Kathmandu',
      });
      setLoading(false);
      toast.success('Report submitted!');
      navigate('/home');
    }, 1000);
  };

  const handlePhotoSelect = () => setPhoto('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400');

  return (
    <div className="page-container">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-xl"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-semibold">Report Issue</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-5 space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">Issue Type *</label>
          <div className="flex flex-wrap gap-2">
            {issueTypes.map(type => (
              <IssueTagChip key={type} type={type} selected={selectedType === type} onClick={() => setSelectedType(type)} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Severity</label>
          <div className="flex gap-2">
            {severities.map(s => (
              <button key={s} type="button" onClick={() => setSeverity(s)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${severity === s ? (s === 'Low' ? 'bg-green-100 text-green-700' : s === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700') : 'bg-muted text-muted-foreground'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." className="input-field min-h-[120px] resize-none" required />
        </div>

        <PhotoPreview photo={photo} onRemove={() => setPhoto(null)} onCapture={handlePhotoSelect} onGallery={handlePhotoSelect} />

        <div className="card-elevated p-4 flex items-center gap-3">
          <MapPin className="text-primary" size={20} />
          <div>
            <p className="text-sm font-medium">Location Captured</p>
            <p className="text-xs text-muted-foreground">27.7172, 85.3240</p>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
          <Send size={18} />
          {loading ? 'Submitting...' : 'Submit Report'}
        </motion.button>
      </form>

      <BottomNavigation />
    </div>
  );
}
