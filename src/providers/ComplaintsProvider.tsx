import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Complaint, FilterState, IssueType, ComplaintStatus, Severity } from '@/models/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

interface ComplaintWithVotes extends Complaint {
  userVote?: 'upvote' | 'downvote' | null;
}

interface ComplaintsContextType {
  complaints: ComplaintWithVotes[];
  filteredComplaints: ComplaintWithVotes[];
  filters: FilterState;
  loading: boolean;
  setFilters: (filters: FilterState) => void;
  addComplaint: (complaint: {
    type: IssueType;
    description: string;
    lat: number;
    lng: number;
    location: string;
    photoUrl?: string;
    severity: Severity;
  }) => Promise<boolean>;
  voteComplaint: (id: string, vote: 'up' | 'down') => Promise<void>;
  getComplaintById: (id: string) => ComplaintWithVotes | undefined;
  refreshComplaints: () => Promise<void>;
}

const defaultFilters: FilterState = {
  issueTypes: [],
  severity: null,
  status: null,
  distance: null,
};

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<ComplaintWithVotes[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // Fetch complaints with user profiles
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (complaintsError) throw complaintsError;

      // Fetch all votes
      const { data: votesData, error: votesError } = await supabase
        .from('complaint_votes')
        .select('complaint_id, vote_type, user_id');

      if (votesError) throw votesError;

      // Process complaints with vote counts
      const processedComplaints: ComplaintWithVotes[] = (complaintsData || []).map((c: any) => {
        const complaintVotes = votesData?.filter(v => v.complaint_id === c.id) || [];
        const upvotes = complaintVotes.filter(v => v.vote_type === 'upvote').length;
        const downvotes = complaintVotes.filter(v => v.vote_type === 'downvote').length;
        const userVote = user ? complaintVotes.find(v => v.user_id === user.id)?.vote_type as 'upvote' | 'downvote' | undefined : undefined;

        return {
          id: c.id,
          type: c.type as IssueType,
          description: c.description,
          lat: c.lat,
          lng: c.lng,
          location: c.location || `${c.lat.toFixed(4)}°N, ${c.lng.toFixed(4)}°E`,
          photoUrl: c.photo_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400',
          status: c.status as ComplaintStatus,
          severity: c.severity as Severity,
          user: c.profiles?.full_name || 'Anonymous',
          userAvatar: c.profiles?.avatar_url,
          timestamp: c.created_at,
          upvotes,
          downvotes,
          userVote: userVote || null,
          isUserVoted: userVote === 'upvote' ? 'up' : userVote === 'downvote' ? 'down' : undefined,
        };
      });

      setComplaints(processedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const filteredComplaints = complaints.filter(complaint => {
    if (filters.issueTypes.length > 0 && !filters.issueTypes.includes(complaint.type)) {
      return false;
    }
    if (filters.severity && complaint.severity !== filters.severity) {
      return false;
    }
    if (filters.status && complaint.status !== filters.status) {
      return false;
    }
    return true;
  });

  const addComplaint = async (newComplaint: {
    type: IssueType;
    description: string;
    lat: number;
    lng: number;
    location: string;
    photoUrl?: string;
    severity: Severity;
  }): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to report an issue');
      return false;
    }

    try {
      const { error } = await supabase.from('complaints').insert({
        user_id: user.id,
        type: newComplaint.type,
        description: newComplaint.description,
        lat: newComplaint.lat,
        lng: newComplaint.lng,
        location: newComplaint.location,
        photo_url: newComplaint.photoUrl,
        severity: newComplaint.severity,
      });

      if (error) throw error;

      toast.success('Report submitted! You earned 10 points! 🎉');
      await fetchComplaints();
      return true;
    } catch (error: any) {
      console.error('Error adding complaint:', error);
      toast.error('Failed to submit report');
      return false;
    }
  };

  const voteComplaint = async (id: string, vote: 'up' | 'down') => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return;
    }

    const complaint = complaints.find(c => String(c.id) === id);
    if (!complaint) return;

    const voteType = vote === 'up' ? 'upvote' : 'downvote';
    const existingVote = complaint.userVote;

    try {
      if (existingVote === voteType) {
        // Remove vote
        const { error } = await supabase
          .from('complaint_votes')
          .delete()
          .eq('complaint_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Vote removed');
      } else if (existingVote) {
        // Change vote
        const { error } = await supabase
          .from('complaint_votes')
          .update({ vote_type: voteType })
          .eq('complaint_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success(vote === 'up' ? 'Changed to upvote!' : 'Changed to downvote');
      } else {
        // New vote
        const { error } = await supabase.from('complaint_votes').insert({
          complaint_id: id,
          user_id: user.id,
          vote_type: voteType,
        });

        if (error) throw error;
        if (vote === 'up') {
          toast.success('Upvoted! Post owner earned 3 points');
        } else {
          toast.success('Downvoted');
        }
      }

      await fetchComplaints();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const getComplaintById = (id: string) => {
    return complaints.find(c => String(c.id) === id);
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        filteredComplaints,
        filters,
        loading,
        setFilters,
        addComplaint,
        voteComplaint,
        getComplaintById,
        refreshComplaints: fetchComplaints,
      }}
    >
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
}
