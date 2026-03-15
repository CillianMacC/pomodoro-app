import type { TimerMode } from './Timer';

export interface SessionRecord {
  id: string;
  date: string; // ISO string
  duration: number; // minutes
  mode: TimerMode;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionRecord[];
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryModal({ isOpen, onClose, sessions, onDeleteSession, onClearAll }: HistoryModalProps) {
  if (!isOpen) return null;

  // Group by date (local string)
  const groupedSessions = sessions.reduce((acc, session) => {
    const localDate = new Date(session.date).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    if (!acc[localDate]) acc[localDate] = [];
    acc[localDate].push(session);
    return acc;
  }, {} as Record<string, SessionRecord[]>);

  const sortedDates = Object.keys(groupedSessions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel p-6 sm:p-8 w-full max-w-2xl bg-zinc-900/90 border-white/10 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
        >
          ✕
        </button>
        
        <div className="flex justify-between items-center mb-6 pr-8">
           <h2 className="text-2xl font-semibold">Stats & History</h2>
           {sessions.length > 0 && (
             <button 
               onClick={() => {
                 if (window.confirm("Are you sure you want to clear all history? This cannot be undone.")) {
                   onClearAll();
                 }
               }}
               className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
             >
                Clear All History
             </button>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin">
          {sortedDates.length === 0 ? (
            <div className="text-center opacity-50 py-12">No sessions recorded yet. Time to focus!</div>
          ) : (
            sortedDates.map(date => {
              const daySessions = groupedSessions[date];
              const dayTotalMins = daySessions.filter(s => s.mode === 'focus').reduce((sum, s) => sum + s.duration, 0);
              
              return (
                <div key={date} className="space-y-3">
                  <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                     <h3 className="text-sm uppercase tracking-wider opacity-70 font-medium">{date}</h3>
                     <span className="text-xs font-semibold text-white/50">{Math.floor(dayTotalMins / 60)}h {dayTotalMins % 60}m focus time</span>
                  </div>
                  
                  <div className="space-y-2">
                    {daySessions.map(session => (
                      <div key={session.id} className="flex justify-between items-center bg-white/5 rounded-lg p-3 group">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${session.mode === 'focus' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`}></span>
                          <div>
                            <p className="text-sm font-medium capitalize">{session.mode.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-xs opacity-50">{formatTime(session.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium tabular-nums">{session.duration} min</span>
                          <button 
                            onClick={() => onDeleteSession(session.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            title="Delete record"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
