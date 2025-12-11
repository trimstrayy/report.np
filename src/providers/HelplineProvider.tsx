import React, { createContext, useContext, ReactNode } from 'react';
import { HelplineCategory } from '@/models/types';

const helplineData: HelplineCategory[] = [
  {
    id: 'police',
    name: 'Police',
    icon: 'shield',
    contacts: [
      { id: '1', name: 'Nepal Police Emergency', number: '100', description: '24/7 Emergency Helpline' },
      { id: '2', name: 'Metropolitan Police', number: '01-4261945', description: 'Kathmandu Metro' },
    ],
  },
  {
    id: 'traffic',
    name: 'Traffic Police',
    icon: 'traffic-cone',
    contacts: [
      { id: '1', name: 'Traffic Helpline', number: '103', description: 'Traffic Information' },
      { id: '2', name: 'Traffic Control Room', number: '01-4228450', description: 'Accident Reports' },
    ],
  },
  {
    id: 'ambulance',
    name: 'Ambulance',
    icon: 'ambulance',
    contacts: [
      { id: '1', name: 'Red Cross Ambulance', number: '102', description: '24/7 Ambulance Service' },
      { id: '2', name: 'Bir Hospital', number: '01-4221119', description: 'Emergency' },
    ],
  },
  {
    id: 'fire',
    name: 'Fire Brigade',
    icon: 'flame',
    contacts: [
      { id: '1', name: 'Fire Brigade Emergency', number: '101', description: 'Fire & Rescue' },
    ],
  },
  {
    id: 'municipality',
    name: 'Municipality',
    icon: 'building',
    contacts: [
      { id: '1', name: 'KMC Helpline', number: '01-4268804', description: 'Kathmandu Municipality' },
      { id: '2', name: 'Lalitpur Municipality', number: '01-5521207', description: 'Lalitpur' },
    ],
  },
  {
    id: 'ward',
    name: 'Ward Office',
    icon: 'map-pin',
    contacts: [
      { id: '1', name: 'Ward 32 Office', number: '01-4267891', description: 'Local Ward' },
    ],
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: 'zap',
    contacts: [
      { id: '1', name: 'NEA Fault Line', number: '1150', description: 'Power Issues' },
      { id: '2', name: 'NEA Customer Care', number: '1159', description: 'Billing & Queries' },
    ],
  },
  {
    id: 'water',
    name: 'Water Supply',
    icon: 'droplets',
    contacts: [
      { id: '1', name: 'KUKL Helpline', number: '01-4417766', description: 'Water Supply Issues' },
    ],
  },
  {
    id: 'animal',
    name: 'Animal Rescue',
    icon: 'heart',
    contacts: [
      { id: '1', name: 'KAT Animal Shelter', number: '01-5522555', description: 'Animal Rescue' },
      { id: '2', name: 'Sneha\'s Care', number: '01-4672929', description: 'Animal Welfare' },
    ],
  },
  {
    id: 'women',
    name: 'Women & Children',
    icon: 'users',
    contacts: [
      { id: '1', name: 'Women Helpline', number: '1145', description: 'Violence Against Women' },
      { id: '2', name: 'Child Helpline', number: '104', description: 'Child Protection' },
    ],
  },
];

interface HelplineContextType {
  helplines: HelplineCategory[];
  searchHelplines: (query: string) => HelplineCategory[];
}

const HelplineContext = createContext<HelplineContextType | undefined>(undefined);

export function HelplineProvider({ children }: { children: ReactNode }) {
  const searchHelplines = (query: string): HelplineCategory[] => {
    if (!query) return helplineData;
    const lowercaseQuery = query.toLowerCase();
    return helplineData.filter(
      category =>
        category.name.toLowerCase().includes(lowercaseQuery) ||
        category.contacts.some(
          contact =>
            contact.name.toLowerCase().includes(lowercaseQuery) ||
            contact.number.includes(query)
        )
    );
  };

  return (
    <HelplineContext.Provider value={{ helplines: helplineData, searchHelplines }}>
      {children}
    </HelplineContext.Provider>
  );
}

export function useHelplines() {
  const context = useContext(HelplineContext);
  if (context === undefined) {
    throw new Error('useHelplines must be used within a HelplineProvider');
  }
  return context;
}
