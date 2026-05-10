import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  MapPin,
  Camera,
  Layers,
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { cn } from "../lib/utils";

interface ReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: { lat: number; lng: number } | null;
  onSubmit: (data: any) => void;
}

const REPORT_TYPES = [
  { id: 'danger', name: 'Danger', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'safety', name: 'Safe Spot', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
];

const CATEGORIES = {
  danger: [
    "Suspicious Activity",
    "Robbery Risk",
    "Dark Street",
    "Harassment Zone",
    "Broken Road"
  ],
  safety: [
    "Police Presence",
    "Good Lighting",
    "Crowded Safe Area",
    "CCTV Presence"
  ]
};

export default function ReportingModal({ isOpen, onClose, coordinates, onSubmit }: ReportingModalProps) {
  const [type, setType] = useState<'danger' | 'safety'>('danger');
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(3);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md glass-card overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                Report Location
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                {REPORT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                      type === t.id 
                        ? "border-white/40 bg-white/10 shadow-lg" 
                        : "border-white/10 bg-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <t.icon size={18} className={t.color} />
                    <span className="font-medium">{t.name}</span>
                  </button>
                ))}
              </div>

              {/* Coordinates Display */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                <MapPin size={14} />
                <span>{coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}</span>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES[type].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        category === cat 
                          ? "bg-neon-blue/20 border-neon-blue text-neon-blue" 
                          : "bg-white/5 border-white/10 text-gray-300 hover:border-white/30"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what you see..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-neon-blue/50 min-h-[100px] resize-none"
                />
              </div>

              {/* Severity Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Severity / Reliability
                  </label>
                  <span className="text-xs font-bold text-neon-blue">{severity}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={() => onSubmit({ type, category, description, severity })}
                disabled={!category}
                className="w-full py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold shadow-lg shadow-neon-blue/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Submit Report
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
