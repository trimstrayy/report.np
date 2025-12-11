import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { FilterState, IssueType, ComplaintStatus, Severity } from '@/models/types';
import { IssueTagChip } from './IssueTagChip';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

const issueTypes: IssueType[] = [
  'Road Damage',
  'Streetlight Problem',
  'Water Leakage',
  'Sewage',
  'Noise',
  'Crime',
  'Accident',
  'Pollution',
];

const statuses: ComplaintStatus[] = ['Pending', 'Verified', 'In Progress', 'Resolved'];
const severities: Severity[] = ['Low', 'Medium', 'High'];

export function FilterSheet({ isOpen, onClose, filters, onApply }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const toggleIssueType = (type: IssueType) => {
    setLocalFilters(prev => ({
      ...prev,
      issueTypes: prev.issueTypes.includes(type)
        ? prev.issueTypes.filter(t => t !== type)
        : [...prev.issueTypes, type],
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      issueTypes: [],
      severity: null,
      status: null,
      distance: null,
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Issue Types */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Issue Type</h3>
                <div className="flex flex-wrap gap-2">
                  {issueTypes.map(type => (
                    <IssueTagChip
                      key={type}
                      type={type}
                      selected={localFilters.issueTypes.includes(type)}
                      onClick={() => toggleIssueType(type)}
                    />
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Severity</h3>
                <div className="flex gap-2">
                  {severities.map(severity => (
                    <button
                      key={severity}
                      type="button"
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          severity: prev.severity === severity ? null : severity,
                        }))
                      }
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        localFilters.severity === severity
                          ? severity === 'Low'
                            ? 'bg-green-100 text-green-700'
                            : severity === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setLocalFilters(prev => ({
                          ...prev,
                          status: prev.status === status ? null : status,
                        }))
                      }
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        localFilters.status === status
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border flex gap-3 safe-area-bottom">
              <button onClick={handleReset} className="btn-secondary flex-1">
                Reset
              </button>
              <button onClick={handleApply} className="btn-primary flex-1">
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
