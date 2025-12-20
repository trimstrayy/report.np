import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onSkip: () => void;
  loading?: boolean;
}

export function LocationPermissionModal({
  isOpen,
  onAllow,
  onSkip,
  loading = false,
}: LocationPermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-card rounded-3xl p-8 max-w-sm w-full shadow-xl border border-border"
          >
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Navigation size={36} className="text-primary" />
                </motion.div>
              </motion.div>

              <h2 className="text-xl font-bold text-foreground mb-2">
                Enable Location
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Report.np uses your location to show nearby issues and help you report problems in your area accurately.
              </p>

              <div className="space-y-3">
                <button
                  onClick={onAllow}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <MapPin size={18} />
                  {loading ? 'Getting Location...' : 'Allow Location'}
                </button>
                <button
                  onClick={onSkip}
                  className="w-full py-3 text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                You can change this anytime in your device settings
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
