import { motion } from 'framer-motion';
import { MapPin, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Complaint } from '@/models/types';
import { StatusBadge } from './StatusBadge';
import { IssueTagChip } from './IssueTagChip';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '@/providers/ComplaintsProvider';
import { useAuth } from '@/providers/AuthProvider';

interface ComplaintCardProps {
  complaint: Complaint & { userVote?: 'upvote' | 'downvote' | null };
  index?: number;
}

export function ComplaintCard({ complaint, index = 0 }: ComplaintCardProps) {
  const navigate = useNavigate();
  const { voteComplaint } = useComplaints();
  const { isGuest } = useAuth();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const handleVote = async (e: React.MouseEvent, vote: 'up' | 'down') => {
    e.stopPropagation();
    await voteComplaint(String(complaint.id), vote);
  };

  const isUpvoted = complaint.userVote === 'upvote' || complaint.isUserVoted === 'up';
  const isDownvoted = complaint.userVote === 'downvote' || complaint.isUserVoted === 'down';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/complaint/${complaint.id}`)}
      className="card-elevated p-4 cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {complaint.userAvatar ? (
            <img
              src={complaint.userAvatar}
              alt={complaint.user}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {complaint.user.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm font-medium text-foreground">{complaint.user}</span>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      {/* Image */}
      <div className="relative rounded-xl overflow-hidden mb-3">
        <img
          src={complaint.photoUrl}
          alt={complaint.type}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 left-2">
          <IssueTagChip type={complaint.type} />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground mb-2 line-clamp-2">
        {complaint.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          <span>{complaint.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatTimestamp(complaint.timestamp)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <button
          onClick={(e) => handleVote(e, 'up')}
          disabled={isGuest}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
            isUpvoted
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted text-muted-foreground'
          } ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp size={16} fill={isUpvoted ? 'currentColor' : 'none'} />
          <span className="text-sm font-medium">{complaint.upvotes}</span>
        </button>
        <button
          onClick={(e) => handleVote(e, 'down')}
          disabled={isGuest}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
            isDownvoted
              ? 'bg-destructive/10 text-destructive'
              : 'hover:bg-muted text-muted-foreground'
          } ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsDown size={16} fill={isDownvoted ? 'currentColor' : 'none'} />
          <span className="text-sm font-medium">{complaint.downvotes}</span>
        </button>
      </div>
    </motion.article>
  );
}
