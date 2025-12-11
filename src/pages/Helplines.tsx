import { ArrowLeft, Phone, Shield, Flame, Building, Zap, Droplets, Heart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHelplines } from '@/providers/HelplineProvider';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = { shield: Shield, flame: Flame, building: Building, zap: Zap, droplets: Droplets, heart: Heart, users: Users };

export default function Helplines() {
  const { helplines } = useHelplines();
  const navigate = useNavigate();

  const handleCall = (number: string) => window.open(`tel:${number}`, '_self');

  return (
    <div className="page-container">
      <header className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-xl"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-semibold">Emergency Helplines</h1>
      </header>

      <div className="px-4 space-y-4">
        {helplines.map((category, i) => {
          const Icon = iconMap[category.icon] || Phone;
          return (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-elevated overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Icon size={20} className="text-primary" /></div>
                <h2 className="font-semibold">{category.name}</h2>
              </div>
              <div className="divide-y divide-border">
                {category.contacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.description}</p>
                    </div>
                    <button onClick={() => handleCall(contact.number)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium">
                      <Phone size={16} />{contact.number}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
