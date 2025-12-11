// Report.np - Type Definitions

export type IssueType = 
  | 'Road Damage'
  | 'Streetlight Problem'
  | 'Water Leakage'
  | 'Sewage'
  | 'Noise'
  | 'Crime'
  | 'Accident'
  | 'Pollution';

export type ComplaintStatus = 'Pending' | 'Verified' | 'In Progress' | 'Resolved';

export type Severity = 'Low' | 'Medium' | 'High';

export interface Complaint {
  id: number;
  type: IssueType;
  description: string;
  lat: number;
  lng: number;
  photoUrl: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  status: ComplaintStatus;
  severity: Severity;
  user: string;
  userAvatar?: string;
  timestamp: string;
  location: string;
  upvotes: number;
  downvotes: number;
  isUserVoted?: 'up' | 'down' | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  points: number;
  rank: 'Bronze' | 'Silver' | 'Gold';
  reportsCount: number;
  resolvedCount: number;
}

export interface HelplineCategory {
  id: string;
  name: string;
  icon: string;
  contacts: HelplineContact[];
}

export interface HelplineContact {
  id: string;
  name: string;
  number: string;
  description?: string;
}

export interface FilterState {
  issueTypes: IssueType[];
  severity: Severity | null;
  status: ComplaintStatus | null;
  distance: number | null;
}
