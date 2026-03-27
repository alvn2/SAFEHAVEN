import React, { useState, useEffect } from 'react';
import { Modal, Button } from './ui';
import { AlertTriangle, MessageCircle, Database, Phone } from 'lucide-react';
import { CRISIS_NUMBERS } from '../utils/constants';

const BreathingExercise = ({ onClose }: { onClose?: () => void }) => {
    const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
    const [timeLeft, setTimeLeft] = useState(4);
    useEffect(() => {
        const timer = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev === 1) {
            if (phase === 'Inhale') { setPhase('Hold'); return 4; }
            else if (phase === 'Hold') { setPhase('Exhale'); return 4; }
            else { setPhase('Inhale'); return 4; }
            }
            return prev - 1;
        });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase]);
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-primary-50 dark:bg-gray-900 rounded-2xl">
           <h3 className="text-xl font-bold text-primary-900 dark:text-primary-300 mb-8">Grounding Breathing</h3>
           <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-4 border-primary-300 dark:border-primary-800 transition-all duration-1000 ${phase === 'Inhale' ? 'scale-110 bg-primary-200' : 'scale-90 bg-white dark:bg-gray-800'}`}>
               <div className="text-center">
                   <p className="text-2xl font-bold text-primary-800 dark:text-primary-400 mb-1">{phase}</p>
                   <p className="text-lg text-primary-600 dark:text-primary-500">{timeLeft}s</p>
               </div>
           </div>
           {onClose && <Button variant="outline" className="mt-6" onClick={onClose}>Close</Button>}
        </div>
    );
};

export const TriageModal = ({ isOpen, onClose, onNavigate }: { isOpen: boolean; onClose: () => void; onNavigate: (path: string) => void }) => {
  const [step, setStep] = useState<'ask' | 'crisis' | 'anxious'>('ask');
  
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={true} onClose={onClose} title={step === 'ask' ? "How are you feeling right now?" : "We're here for you"}>
      {step === 'ask' && (
        <div className="grid gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-center mb-4">Your answer helps us guide you to the right place.</p>
          <button onClick={() => setStep('crisis')} className="p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900 rounded-2xl text-left hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-4 group">
            <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-lg text-red-600 dark:text-red-400"><AlertTriangle size={24} /></div>
            <div>
              <span className="block text-lg font-bold text-red-800 dark:text-red-300">I am in Crisis</span>
              <span className="text-sm text-red-600 dark:text-red-400">I need immediate help or feel unsafe.</span>
            </div>
          </button>
          <button onClick={() => setStep('anxious')} className="p-5 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-100 dark:border-orange-900 rounded-2xl text-left hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors flex items-center gap-4 group">
            <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-lg text-orange-600 dark:text-orange-400"><MessageCircle size={24} /></div>
            <div>
              <span className="block text-lg font-bold text-orange-800 dark:text-orange-300">I need to Talk</span>
              <span className="text-sm text-orange-600 dark:text-orange-400">Connect me with a volunteer listener.</span>
            </div>
          </button>
          <button onClick={() => { onClose(); onNavigate('/seeker/dashboard'); }} className="p-5 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-900 rounded-2xl text-left hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-4 group">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400"><Database size={24} /></div>
            <div>
              <span className="block text-lg font-bold text-blue-800 dark:text-blue-300">Just Checking In</span>
              <span className="text-sm text-blue-600 dark:text-blue-400">I want to use my journal or read.</span>
            </div>
          </button>
        </div>
      )}
      {step === 'crisis' && (
        <div className="space-y-4">
            {CRISIS_NUMBERS.map((c, i) => (
                <div key={i} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="font-semibold dark:text-white">{c.name}</span>
                    <a href={`tel:${c.number}`} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        <Phone size={16} /> Call
                    </a>
                </div>
            ))}
        </div>
      )}
      {step === 'anxious' && (
        <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-800 dark:text-blue-300">
                <p className="mb-4 text-center font-medium">Take a moment to breathe. It helps.</p>
                <BreathingExercise />
            </div>
            <div className="flex gap-2">
                <Button variant="primary" className="flex-1" onClick={() => onNavigate('/volunteers')}>Find Support</Button>
                <Button variant="outline" className="flex-1" onClick={() => onNavigate('/resources')}>Read Articles</Button>
            </div>
        </div>
      )}
    </Modal>
  );
};