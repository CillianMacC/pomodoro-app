import { useState, useEffect } from 'react';

export function Scratchpad() {
  const [text, setText] = useState(() => {
    return localStorage.getItem('focus-scratchpad') || '';
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('focus-scratchpad', text);
    }, 500); // Debounce save
    return () => clearTimeout(timeoutId);
  }, [text]);

  return (
    <div className="glass-panel h-1/3 min-h-[160px] p-6 flex flex-col">
      <h2 className="text-lg font-semibold mb-3 opacity-90 tracking-tight">Brain Dump</h2>
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Empty your mind here..." 
        className="w-full flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-white/30 opacity-80"
      ></textarea>
    </div>
  );
}
