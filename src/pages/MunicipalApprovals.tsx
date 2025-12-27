import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Building2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  municipal_name: string | null;
  municipal_address: string | null;
  created_at: string;
}

export default function MunicipalApprovals() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, municipal_name, municipal_address, created_at')
      .eq('account_type', 'municipal')
      .eq('approval_status', 'pending');

    if (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load pending requests');
    } else {
      setPendingRequests(data || []);
    }
    setLoading(false);
  };

  const handleApproval = async (requestId: string, approve: boolean) => {
    setProcessingId(requestId);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: approve ? 'approved' : 'rejected',
        approved_by: profile?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to process request');
      console.error(error);
    } else {
      toast.success(approve ? 'Account approved!' : 'Account rejected');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    }
    setProcessingId(null);
  };

  // Only municipal accounts can access this page
  if (profile?.account_type !== 'municipal' || profile?.approval_status !== 'approved') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <Building2 size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">Only approved municipal accounts can access this page.</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-xl">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Municipal Approvals</h1>
          <p className="text-sm text-muted-foreground">Approve new municipal accounts</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
            <p className="text-muted-foreground">All municipal account requests have been processed.</p>
          </div>
        ) : (
          pendingRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-4 border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{request.municipal_name}</h3>
                  <p className="text-sm text-muted-foreground">{request.municipal_address}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Representative:</span> {request.full_name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {request.email}</p>
                    {request.phone && <p><span className="text-muted-foreground">Phone:</span> {request.phone}</p>}
                    <p className="text-xs text-muted-foreground">
                      Applied: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleApproval(request.id, false)}
                  disabled={processingId === request.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                  Reject
                </button>
                <button
                  onClick={() => handleApproval(request.id, true)}
                  disabled={processingId === request.id}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Check size={18} />
                  Approve
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
