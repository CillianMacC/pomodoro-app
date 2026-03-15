import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
}

export function VolumeControl({ volume, setVolume, isMuted, setIsMuted }: VolumeControlProps) {
  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className={`w-20 h-20 flex items-center justify-center rounded-3xl transition-all shadow-xl ${isMuted || volume === 0 ? 'bg-red-400/20 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted || volume === 0 ? <VolumeX size={36} /> : <Volume2 size={36} />}
      </button>
      
      <div className="w-full max-w-[240px] flex flex-col items-center gap-4">
         <span className="text-5xl font-light tabular-nums opacity-90">
           {isMuted ? 0 : volume}<span className="text-2xl opacity-50">%</span>
         </span>
         
         <input
           type="range"
           min="0"
           max="100"
           value={isMuted ? 0 : volume}
           onChange={(e) => {
             const val = Number(e.target.value);
             setVolume(val);
             if (val > 0 && isMuted) setIsMuted(false);
           }}
           className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all outline-none"
         />
      </div>
    </div>
  );
}
