import { useState, useEffect } from 'react';
import type { TimerMode } from './Timer';

const QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "You don't have to be extreme, just consistent.",
  "Focus is a matter of deciding what things you're not going to do.",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
  "The only bad workout is the one that didn't happen.",
  "Do something today that your future self will thank you for.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Starve your distractions, feed your focus.",
  "There are two types of pain: the pain of discipline and the pain of regret.",
  "Work while they sleep. Learn while they party. Save while they spend. Live like they dream.",
  "Motivation is what gets you started. Habit is what keeps you going."
];

interface QuoteDisplayProps {
  mode: TimerMode;
  trigger: number;
}

export function QuoteDisplay({ mode, trigger }: QuoteDisplayProps) {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    // Pick a random quote avoiding the immediate previous one if possible
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(prev => {
      let next = prev;
      while (next === prev) {
         next = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      }
      return next;
    });
  }, [mode, trigger]); // Update whenever mode changes or manual trigger

  return (
    <p className="text-lg md:text-xl font-medium italic opacity-70 drop-shadow-md max-w-4xl mx-auto px-4 animate-fade-in transition-all duration-1000">
      "{quote}"
    </p>
  );
}
