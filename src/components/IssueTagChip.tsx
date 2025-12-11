import { IssueType } from '@/models/types';
import {
  AlertTriangle,
  Lightbulb,
  Droplets,
  Trash2,
  Volume2,
  ShieldAlert,
  Car,
  Factory,
} from 'lucide-react';

interface IssueTagChipProps {
  type: IssueType;
  selected?: boolean;
  onClick?: () => void;
}

const issueConfig: Record<IssueType, { icon: React.ElementType; bgClass: string; textClass: string }> = {
  'Road Damage': {
    icon: AlertTriangle,
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
  'Streetlight Problem': {
    icon: Lightbulb,
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
  },
  'Water Leakage': {
    icon: Droplets,
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  Sewage: {
    icon: Trash2,
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
  },
  Noise: {
    icon: Volume2,
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
  Crime: {
    icon: ShieldAlert,
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
  Accident: {
    icon: Car,
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-700',
  },
  Pollution: {
    icon: Factory,
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
};

export function IssueTagChip({ type, selected, onClick }: IssueTagChipProps) {
  const config = issueConfig[type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`issue-tag ${config.bgClass} ${config.textClass} ${
        selected ? 'ring-2 ring-primary ring-offset-1' : ''
      } ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      <Icon size={14} />
      <span>{type}</span>
    </button>
  );
}
