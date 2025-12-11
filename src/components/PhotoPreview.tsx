import { X, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoPreviewProps {
  photo: string | null;
  onRemove: () => void;
  onCapture: () => void;
  onGallery: () => void;
}

export function PhotoPreview({ photo, onRemove, onCapture, onGallery }: PhotoPreviewProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Upload Photo</label>
      
      <AnimatePresence mode="wait">
        {photo ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <img
              src={photo}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground"
            >
              <X size={18} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            <button
              type="button"
              onClick={onCapture}
              className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Camera size={24} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Camera</span>
            </button>
            <button
              type="button"
              onClick={onGallery}
              className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <ImageIcon size={24} className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Gallery</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
