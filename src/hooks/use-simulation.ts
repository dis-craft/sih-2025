import { useState, useEffect } from 'react';

type Train = {
    id: string;
    type: 'express' | 'passenger' | 'freight' | 'emergency';
    path: string;
    progress: number; // 0 to 1
    speed: number; // progress per second
};

const initialTrains: Train[] = [
    { id: 'T12613', type: 'express', path: 'path1', progress: 0.1, speed: 0.05 },
    { id: 'T16216', type: 'passenger', path: 'path2', progress: 0.3, speed: 0.03 },
    { id: 'T20660', type: 'express', path: 'path3', progress: 0.6, speed: 0.06 },
    { id: 'F5678', type: 'freight', path: 'path4', progress: 0.8, speed: 0.02 },
];


export const useSimulation = () => {
    const [trains, setTrains] = useState<Train[]>(initialTrains);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setTrains(currentTrains => 
                currentTrains.map(train => {
                    let newProgress = train.progress + train.speed / 10; // Update progress
                    
                    // Handle transition from entry path to exit path
                    if (newProgress >= 1) {
                        let nextPath = '';
                        if (train.path === 'path1' || train.path === 'path2') {
                            nextPath = 'outPath1';
                        } else if (train.path === 'path3') {
                            nextPath = 'outPath2';
                        } else if (train.path === 'path4') {
                            nextPath = 'outPath3';
                        } else {
                             // Reset train to an entry path
                             const entryPaths = ['path1', 'path2', 'path3', 'path4'];
                             nextPath = entryPaths[Math.floor(Math.random() * entryPaths.length)];
                             newProgress = 0; // Start from beginning of new path
                        }
                         return { ...train, path: nextPath, progress: newProgress - 1 };
                    }

                    return { ...train, progress: newProgress };
                })
            );
        }, 100); // Update every 100ms

        return () => clearInterval(interval);
    }, [isRunning]);

    return { trains, setTrains, isRunning, setIsRunning };
};
