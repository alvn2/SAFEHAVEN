import React, { useState, useEffect } from 'react';
import { Card, Button } from '../components/ui';
import { Wind, Anchor, StopCircle, PlayCircle } from 'lucide-react';

const BreathingTool = () => {
    const [isActive, setIsActive] = useState(false);
    const [text, setText] = useState('Ready');
    const [scale, setScale] = useState(1);

    useEffect(() => {
        if(!isActive) return;
        let step = 0;
        const cycle = () => {
            if(step % 3 === 0) { setText('Inhale (4s)'); setScale(1.5); }
            if(step % 3 === 1) { setText('Hold (7s)'); setScale(1.5); }
            if(step % 3 === 2) { setText('Exhale (8s)'); setScale(1); }
            step++;
        }
        cycle();
        const interval = setInterval(cycle, 4000); 
        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <Card className="p-8 text-center flex flex-col items-center">
            <div className={`w-40 h-40 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center transition-all duration-[4000ms] ease-in-out mb-6`} style={{ transform: `scale(${scale})` }}>
                <span className="font-bold text-blue-600 dark:text-blue-300 text-lg">{text}</span>
            </div>
            <Button onClick={() => setIsActive(!isActive)} variant={isActive ? 'danger' : 'primary'}>
                {isActive ? <><StopCircle className="mr-2"/> Stop</> : <><PlayCircle className="mr-2"/> Start Breathing</>}
            </Button>
        </Card>
    );
};

export const ToolsPage = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-serif dark:text-white">Mental Health Toolkit</h1>
                <p className="text-gray-500">Offline-first tools to help you ground yourself.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white"><Wind className="text-blue-500"/> 4-7-8 Breathing</h2>
                    <BreathingTool />
                </div>
                
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white"><Anchor className="text-green-500"/> 5-4-3-2-1 Grounding</h2>
                    <Card className="p-6 space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Acknowledge:</p>
                        <ul className="space-y-2 text-sm dark:text-white">
                            <li className="flex gap-2"><span className="font-bold bg-green-100 text-green-800 px-2 rounded">5</span> things you see</li>
                            <li className="flex gap-2"><span className="font-bold bg-green-100 text-green-800 px-2 rounded">4</span> things you can touch</li>
                            <li className="flex gap-2"><span className="font-bold bg-green-100 text-green-800 px-2 rounded">3</span> things you hear</li>
                            <li className="flex gap-2"><span className="font-bold bg-green-100 text-green-800 px-2 rounded">2</span> things you can smell</li>
                            <li className="flex gap-2"><span className="font-bold bg-green-100 text-green-800 px-2 rounded">1</span> thing you can taste</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};