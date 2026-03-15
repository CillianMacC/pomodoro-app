import { useState, useEffect } from 'react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focus-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    localStorage.setItem('focus-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!inputValue.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), text: inputValue.trim(), completed: false }]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="glass-panel flex-1 p-6 flex flex-col min-h-0">
      <h2 className="text-xl font-semibold mb-4 opacity-90 tracking-tight">Tasks</h2>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..." 
          className="w-full bg-black/20 focus:bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 text-sm transition-all placeholder:text-white/30" 
        />
      </div>
      <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin">
        {tasks.map(task => (
           <div key={task.id} className="flex items-center gap-3 group">
             <button 
               onClick={() => toggleTask(task.id)}
               className={`w-5 h-5 rounded-md border border-white/30 flex-shrink-0 transition-colors relative cursor-pointer ${task.completed ? 'bg-white/20' : 'hover:bg-white/10'}`}
             >
               {task.completed && (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                 </div>
               )}
             </button>
             <span className={`text-sm flex-1 transition-all ${task.completed ? 'opacity-40 line-through' : 'opacity-90'}`}>
               {task.text}
             </span>
             <button
               onClick={() => deleteTask(task.id)}
               className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-all text-xs"
             >
               ✕
             </button>
           </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-sm opacity-40 text-center mt-4">No tasks yet. You're all caught up!</div>
        )}
      </div>
    </div>
  );
}
