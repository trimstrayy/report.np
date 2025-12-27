import { ArrowLeft, MapPin, Clock, ThumbsUp, ThumbsDown, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useComplaints } from '@/providers/ComplaintsProvider';
import { StatusBadge } from '@/components/StatusBadge';
import { IssueTagChip } from '@/components/IssueTagChip';
import { motion } from 'framer-motion';

const statusSteps = ['Pending', 'Verified', 'In Progress', 'Resolved'] as const;

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, voteComplaint } = useComplaints();
  const complaint = getComplaintById(id || '');

  if (!complaint) return <div className="page-container flex items-center justify-center"><p>Complaint not found</p></div>;

  const currentStepIndex = statusSteps.indexOf(complaint.status);

  return (
    <div className="page-container pb-8">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-xl"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-semibold">Report Details</h1>
      </header>

      <div className="px-4 space-y-6">
        <img src={complaint.photoUrl} alt={complaint.type} className="w-full h-56 object-cover rounded-2xl" />

        <div className="flex items-center justify-between">
          <IssueTagChip type={complaint.type} />
          <StatusBadge status={complaint.status} size="md" />
        </div>

        <p className="text-foreground">{complaint.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1"><MapPin size={16} />{complaint.location}</div>
          <div className="flex items-center gap-1"><Clock size={16} />{new Date(complaint.timestamp).toLocaleDateString()}</div>
        </div>

        {/* Status Timeline */}
        <div className="card-elevated p-4">
          <h3 className="font-semibold mb-4">Status Timeline</h3>
          <div className="space-y-4">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i < currentStepIndex ? <CheckCircle size={16} /> : i === currentStepIndex && step === 'In Progress' ? <Loader2 size={16} className="animate-spin" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className={i <= currentStepIndex ? 'font-medium text-foreground' : 'text-muted-foreground'}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voting */}
        <div className="flex gap-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => voteComplaint(String(complaint.id), 'up')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-xl font-medium">
            <ThumbsUp size={18} /> Upvote ({complaint.upvotes})
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => voteComplaint(String(complaint.id), 'down')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted text-muted-foreground rounded-xl font-medium">
            <ThumbsDown size={18} /> Downvote ({complaint.downvotes})
          </motion.button>
        </div>
      </div>
    </div>
  );
}
