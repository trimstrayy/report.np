import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Complaint, FilterState, IssueType, ComplaintStatus, Severity } from '@/models/types';

const dummyComplaints: Complaint[] = [
  {
    id: 1,
    type: 'Road Damage',
    description: 'Large pothole near main road causing accidents. Multiple vehicles have been damaged.',
    lat: 27.7172,
    lng: 85.324,
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    status: 'Pending',
    severity: 'High',
    user: 'Ram Bahadur',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
    timestamp: '2025-01-10 14:30:00',
    location: 'Kathmandu, Thamel',
    upvotes: 23,
    downvotes: 2,
  },
  {
    id: 2,
    type: 'Streetlight Problem',
    description: 'Street light not working for 2 weeks. Dark area is unsafe for pedestrians.',
    lat: 27.7052,
    lng: 85.3162,
    photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    status: 'Verified',
    severity: 'Medium',
    user: 'Sita Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face',
    timestamp: '2025-01-09 09:15:00',
    location: 'Lalitpur, Pulchowk',
    upvotes: 15,
    downvotes: 0,
  },
  {
    id: 3,
    type: 'Water Leakage',
    description: 'Water pipe burst causing water waste and road damage.',
    lat: 27.6844,
    lng: 85.3188,
    photoUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
    status: 'In Progress',
    severity: 'High',
    user: 'Hari Prasad',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    timestamp: '2025-01-08 16:45:00',
    location: 'Bhaktapur, Suryabinayak',
    upvotes: 31,
    downvotes: 1,
  },
  {
    id: 4,
    type: 'Sewage',
    description: 'Blocked drain causing sewage overflow on street.',
    lat: 27.7219,
    lng: 85.3391,
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop',
    status: 'Resolved',
    severity: 'Medium',
    user: 'Krishna KC',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
    timestamp: '2025-01-05 11:20:00',
    location: 'Kathmandu, Basantapur',
    upvotes: 18,
    downvotes: 3,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    type: 'Pollution',
    description: 'Factory releasing black smoke into residential area.',
    lat: 27.6915,
    lng: 85.2865,
    photoUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop',
    status: 'Pending',
    severity: 'High',
    user: 'Maya Gurung',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
    timestamp: '2025-01-11 08:00:00',
    location: 'Kirtipur, Naya Bazaar',
    upvotes: 42,
    downvotes: 5,
  },
  {
    id: 6,
    type: 'Noise',
    description: 'Construction noise after 10 PM violating noise regulations.',
    lat: 27.7092,
    lng: 85.3205,
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    status: 'Verified',
    severity: 'Low',
    user: 'Binod Thapa',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&crop=face',
    timestamp: '2025-01-10 22:30:00',
    location: 'Lalitpur, Jawalakhel',
    upvotes: 8,
    downvotes: 2,
  },
];

interface ComplaintsContextType {
  complaints: Complaint[];
  filteredComplaints: Complaint[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  addComplaint: (complaint: Omit<Complaint, 'id' | 'upvotes' | 'downvotes' | 'status'>) => void;
  voteComplaint: (id: number, vote: 'up' | 'down') => void;
  getComplaintById: (id: number) => Complaint | undefined;
}

const defaultFilters: FilterState = {
  issueTypes: [],
  severity: null,
  status: null,
  distance: null,
};

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(dummyComplaints);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

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

  const addComplaint = (newComplaint: Omit<Complaint, 'id' | 'upvotes' | 'downvotes' | 'status'>) => {
    const complaint: Complaint = {
      ...newComplaint,
      id: complaints.length + 1,
      upvotes: 0,
      downvotes: 0,
      status: 'Pending',
    };
    setComplaints(prev => [complaint, ...prev]);
    console.log('New complaint added:', JSON.stringify(complaint, null, 2));
  };

  const voteComplaint = (id: number, vote: 'up' | 'down') => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          if (vote === 'up') {
            return { ...c, upvotes: c.upvotes + 1, isUserVoted: 'up' };
          } else {
            return { ...c, downvotes: c.downvotes + 1, isUserVoted: 'down' };
          }
        }
        return c;
      })
    );
  };

  const getComplaintById = (id: number) => {
    return complaints.find(c => c.id === id);
  };

  return (
    <ComplaintsContext.Provider
      value={{
        complaints,
        filteredComplaints,
        filters,
        setFilters,
        addComplaint,
        voteComplaint,
        getComplaintById,
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
