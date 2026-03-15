import type { TimerMode } from './Timer';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  durations: Record<TimerMode, number>;
  setDurations: (v: Record<TimerMode, number>) => void;
  autoFlow: boolean;
  setAutoFlow: (v: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, durations, setDurations, autoFlow, setAutoFlow }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-panel p-8 w-full max-w-md bg-zinc-900/80 border-white/10 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-semibold mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm uppercase tracking-wider opacity-70 font-medium">Timer Durations (minutes)</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs opacity-80">Focus</label>
                <input 
                  type="number" 
                  min="1" max="120"
                  value={durations.focus}
                  onChange={(e) => setDurations({ ...durations, focus: Number(e.target.value) || 25 })}
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs opacity-80">Short Break</label>
                <input 
                  type="number" 
                  min="1" max="60"
                  value={durations.shortBreak}
                  onChange={(e) => setDurations({ ...durations, shortBreak: Number(e.target.value) || 5 })}
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs opacity-80">Long Break</label>
                <input 
                  type="number" 
                  min="1" max="60"
                  value={durations.longBreak}
                  onChange={(e) => setDurations({ ...durations, longBreak: Number(e.target.value) || 15 })}
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/30 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm uppercase tracking-wider opacity-70 font-medium">Preferences</h3>
            
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm opacity-90">Auto-Flow Mode</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={autoFlow}
                  onChange={(e) => setAutoFlow(e.target.checked)}
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${autoFlow ? 'bg-white/40' : 'bg-white/10'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${autoFlow ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
            </label>
            <p className="text-xs opacity-50 mt-1">Automatically start the next session phase without pausing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
