import { useState, useEffect, useRef } from 'react';
import { Settings, Maximize, Minimize, Video, CheckSquare, PenTool, X, Volume2 } from 'lucide-react';
import { Timer, type TimerMode } from './components/Timer';
import { TaskList } from './components/TaskList';
import { Scratchpad } from './components/Scratchpad';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal, type SessionRecord } from './components/HistoryModal';
import { VolumeControl } from './components/VolumeControl';
import { YouTubeBackground } from './components/YouTubeBackground';
import { QuoteDisplay } from './components/QuoteDisplay';
import { extractYouTubeId } from './utils';

const DEFAULT_DURATIONS = { focus: 25, shortBreak: 5, longBreak: 15 };
const DEFAULT_VIDEO = 'jfKfPfyJRdk'; // Lofi Girl as default

type Tab = 'tasks' | 'scratchpad' | 'video' | 'volume' | null;

function App() {
  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem('focus-volume')) || 50;
  });
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('focus-muted') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('focus-volume', String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('focus-muted', String(isMuted));
  }, [isMuted]);

  const [durations, setDurations] = useState<Record<TimerMode, number>>(() => {
    const saved = localStorage.getItem('focus-durations');
    return saved ? JSON.parse(saved) : DEFAULT_DURATIONS;
  });
  
  const [autoFlow, setAutoFlow] = useState(() => {
    return localStorage.getItem('focus-autoflow') === 'true';
  });

  const [videoId, setVideoId] = useState(() => {
    return localStorage.getItem('focus-video') || DEFAULT_VIDEO;
  });
  const [videoInput, setVideoInput] = useState('');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(null);
  
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>(() => {
    const saved = localStorage.getItem('focus-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentMode, setCurrentMode] = useState<TimerMode>('focus');
  const [quoteTrigger, setQuoteTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Custom interface for WakeLock as standard TS dom lib might not have it yet
  interface WakeLockSentinel {
    release: () => Promise<void>;
  }
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Derived state: Total focus time today in minutes
  const totalFocusMinutesToday = sessions
    .filter(s => s.mode === 'focus' && new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.duration, 0);
  
  const formattedFocusTime = `${Math.floor(totalFocusMinutesToday / 60)}h ${totalFocusMinutesToday % 60}m`;

  useEffect(() => {
    localStorage.setItem('focus-durations', JSON.stringify(durations));
  }, [durations]);

  useEffect(() => {
    localStorage.setItem('focus-autoflow', String(autoFlow));
  }, [autoFlow]);

  useEffect(() => {
    localStorage.setItem('focus-video', videoId);
  }, [videoId]);

  useEffect(() => {
    localStorage.setItem('focus-history', JSON.stringify(sessions));
  }, [sessions]);

  // Wake lock logic
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    
    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  const toggleFullscreen = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = window.document as any;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (requestFullScreen) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         requestFullScreen.call(docEl).catch((err: any) => console.error(err));
      }
    } else {
      if (cancelFullScreen) {
         cancelFullScreen.call(doc);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = window.document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    }
  }, []);

  const handleSessionComplete = () => {
    const newSession = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      duration: durations[currentMode],
      mode: currentMode
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    setCurrentMode(newMode);
    setQuoteTrigger(prev => prev + 1);
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(videoInput);
    if (id) {
      setVideoId(id);
      setVideoInput('');
      setActiveTab(null);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white font-sans bg-zinc-900 selection:bg-white/30">
      <YouTubeBackground videoId={videoId} volume={volume} isMuted={isMuted} />

      {/* Main UI Overlay */}
      <div className="relative z-10 w-full h-screen p-4 md:p-8 flex flex-col justify-between pointer-events-none">
        
        {/* Top Header: Stats & Settings */}
        <header className="flex justify-between items-start w-full shrink-0 pointer-events-auto relative z-50">
          <div 
            onClick={() => setHistoryOpen(true)}
            className="glass-panel px-6 py-3 flex items-center gap-3 bg-black/40 border-white/10 backdrop-blur-xl cursor-pointer hover:bg-black/50 transition-colors"
          >
            <div className="flex flex-col">
               <span className="text-xs font-semibold tracking-wider opacity-70 uppercase mb-0.5">Today's Focus</span>
               <span className="text-sm font-medium tracking-wide shadow-black drop-shadow-md">{formattedFocusTime}</span>
            </div>
            <div className="flex gap-1.5 h-full items-center ml-2 border-l border-white/10 pl-4">
              {Array.from({ length: Math.max(4, sessions.filter(s => s.mode === 'focus' && new Date(s.date).toDateString() === new Date().toDateString()).length) }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i < sessions.filter(s => s.mode === 'focus' && new Date(s.date).toDateString() === new Date().toDateString()).length ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/30 backdrop-blur-sm'}`}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 relative z-50">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="glass-button bg-black/40 border-white/10 w-12 h-12 rounded-2xl hover:bg-white/20"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="glass-button bg-black/40 border-white/10 w-12 h-12 rounded-2xl hover:bg-white/20"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </header>

        {/* Center Canvas: Just the pure Timer */}
        <main className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
             <Timer 
               mode={currentMode}
               durations={durations} 
               onSessionComplete={handleSessionComplete}
               onModeSwitch={handleModeSwitch}
             />
          </div>
        </main>

        {/* Bottom Footer: Mode Buttons and Quote */}
        <footer className="shrink-0 flex flex-col items-center gap-6 pb-2 pointer-events-auto z-50">
           
           {/* Mode Selection Toolbar */}
           <div className="flex bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl w-full max-w-[360px] shadow-2xl border border-white/10">
              <button 
                onClick={() => handleModeSwitch('focus')}
                className={`flex-1 py-3 rounded-xl font-medium shadow-sm transition-all sm:text-base text-sm ${currentMode === 'focus' ? 'bg-white text-zinc-900 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                Focus
              </button>
              <button 
                onClick={() => handleModeSwitch('shortBreak')}
                className={`flex-1 py-3 rounded-xl font-medium shadow-sm transition-all sm:text-base text-sm ${currentMode === 'shortBreak' ? 'bg-white text-zinc-900 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                Short Break
              </button>
              <button 
                onClick={() => handleModeSwitch('longBreak')}
                className={`flex-1 py-3 rounded-xl font-medium shadow-sm transition-all sm:text-base text-sm ${currentMode === 'longBreak' ? 'bg-white text-zinc-900 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                Long Break
              </button>
           </div>
           
           <QuoteDisplay mode={currentMode} trigger={quoteTrigger} />
        </footer>
        
      </div>

      {/* Left Side Tools Tab Bar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
         <button 
           onClick={() => setActiveTab(activeTab === 'tasks' ? null : 'tasks')} 
           className={`glass-button w-12 h-12 rounded-2xl bg-black/40 border-white/10 transition-all ${activeTab === 'tasks' ? 'bg-white text-black' : 'hover:bg-white/20'}`}
           title="Tasks"
         >
            <CheckSquare size={20} />
         </button>
         <button 
           onClick={() => setActiveTab(activeTab === 'volume' ? null : 'volume')} 
           className={`glass-button w-12 h-12 rounded-2xl bg-black/40 border-white/10 transition-all ${activeTab === 'volume' ? 'bg-white text-black' : 'hover:bg-white/20'}`}
           title="Volume Control"
         >
            <Volume2 size={20} />
         </button>
      </div>

      {/* Right Side Tools Tab Bar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
         <button 
           onClick={() => setActiveTab(activeTab === 'video' ? null : 'video')} 
           className={`glass-button w-12 h-12 rounded-2xl bg-black/40 border-white/10 transition-all ${activeTab === 'video' ? 'bg-white text-black' : 'hover:bg-white/20'}`}
           title="Background Video"
         >
            <Video size={20} />
         </button>
         <button 
           onClick={() => setActiveTab(activeTab === 'scratchpad' ? null : 'scratchpad')} 
           className={`glass-button w-12 h-12 rounded-2xl bg-black/40 border-white/10 transition-all ${activeTab === 'scratchpad' ? 'bg-white text-black' : 'hover:bg-white/20'}`}
           title="Brain Dump"
         >
            <PenTool size={20} />
         </button>
      </div>

      {/* LEFT Sliding Tab Content Panel (Tasks & Volume) */}
      <div 
        className={`absolute left-0 top-[80px] bottom-[100px] w-full sm:w-[400px] z-40 p-4 sm:p-8 sm:pl-24 flex flex-col justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${(activeTab === 'tasks' || activeTab === 'volume') ? 'translate-x-0' : '-translate-x-full'}`}
      >
         {/* Mobile Close Button */}
         <button 
           onClick={() => setActiveTab(null)}
           className="sm:hidden absolute top-6 left-6 p-2 rounded-full bg-white/10 text-white z-50"
         >
            <X size={24} />
         </button>

         <div className="flex-1 max-h-[80vh] flex flex-col gap-6 relative">
            <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'tasks' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
               <div className="h-full [&>div]:h-full [&>div]:bg-black/60 shadow-2xl">
                  <TaskList />
               </div>
            </div>

            <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'volume' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
               <div className="glass-panel p-6 flex flex-col gap-8 bg-black/60 shadow-2xl h-full justify-center text-center">
                  <div>
                    <h2 className="text-xl font-semibold opacity-90 tracking-tight flex items-center justify-center gap-2 mb-2">
                       <Volume2 size={20} /> Background Audio
                    </h2>
                    <p className="text-sm opacity-60">Adjust the volume of the background video or mute it entirely.</p>
                  </div>
                  
                  <VolumeControl 
                    volume={volume} 
                    setVolume={setVolume} 
                    isMuted={isMuted} 
                    setIsMuted={setIsMuted} 
                  />
               </div>
            </div>
         </div>
      </div>

      {/* RIGHT Sliding Tab Content Panel (Video / Scratchpad) */}
      <div 
        className={`absolute right-0 top-[80px] bottom-[100px] w-full sm:w-[400px] z-40 p-4 sm:p-8 sm:pr-24 flex flex-col justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${(activeTab === 'video' || activeTab === 'scratchpad') ? 'translate-x-0' : 'translate-x-full'}`}
      >
         {/* Mobile Close Button */}
         <button 
           onClick={() => setActiveTab(null)}
           className="sm:hidden absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white z-50"
         >
            <X size={24} />
         </button>

         <div className="flex-1 max-h-[80vh] flex flex-col gap-6 relative">
            <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'video' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
               <div className="glass-panel p-6 flex flex-col gap-4 bg-black/60 shadow-2xl h-full justify-center">
                  <h2 className="text-xl font-semibold opacity-90 tracking-tight flex items-center gap-2">
                     <Video size={20} /> Background Video
                  </h2>
                  <p className="text-sm opacity-60">Paste a YouTube URL to change the background video.</p>
                  <form onSubmit={handleVideoSubmit} className="flex flex-col gap-3 mt-4">
                     <input 
                       type="url" 
                       placeholder="Paste YouTube URL..." 
                       value={videoInput}
                       onChange={(e) => setVideoInput(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 text-sm transition-colors placeholder:text-white/40"
                     />
                     <button type="submit" className="glass-button py-3 px-4 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 border-white/20">
                        Update Video
                     </button>
                  </form>
               </div>
            </div>

            <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'scratchpad' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
               <div className="h-full [&>div]:h-full [&>div]:bg-black/60 shadow-2xl">
                  <Scratchpad />
               </div>
            </div>
         </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        durations={durations}
        setDurations={setDurations}
        autoFlow={autoFlow}
        setAutoFlow={setAutoFlow}
      />

      <HistoryModal 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={sessions}
        onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        onClearAll={() => setSessions([])}
      />
    </div>
  );
}

export default App;
