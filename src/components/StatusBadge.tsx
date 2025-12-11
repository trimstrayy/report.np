import { ComplaintStatus } from '@/models/types';
import { Clock, CheckCircle, Loader2, CheckCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ComplaintStatus, { className: string; icon: React.ElementType }> = {
  Pending: { className: 'status-pending', icon: Clock },
  Verified: { className: 'status-verified', icon: CheckCircle },
  'In Progress': { className: 'status-progress', icon: Loader2 },
  Resolved: { className: 'status-resolved', icon: CheckCheck },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className} ${size === 'md' ? 'px-3 py-1.5 text-sm' : ''}`}>
      <Icon size={size === 'md' ? 16 : 12} className={status === 'In Progress' ? 'animate-spin' : ''} />
      <span className="ml-1">{status}</span>
    </span>
  );
}
