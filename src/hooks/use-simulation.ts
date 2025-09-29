import { useState, useEffect, useCallback } from 'react';

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
    const [trains, setTrains] = useState<Train[]>(() => JSON.parse(JSON.stringify(initialTrains)));
    const [isRunning, setIsRunning] = useState(true);

    const advanceSimulation = useCallback(() => {
        setTrains(currentTrains => 
            currentTrains.map(train => {
                let newProgress = train.progress + train.speed / 10; // Update progress
                
                let newPath = train.path;
                // Handle transition from entry path to exit path
                if (newProgress >= 1) {
                    if (train.path === 'path1' || train.path === 'path2') {
                        newPath = 'outPath1';
                    } else if (train.path === 'path3') {
                        newPath = 'outPath2';
                    } else if (train.path === 'path4') {
                        newPath = 'outPath3';
                    } else {
                         // Reset train to an entry path
                         const entryPaths = ['path1', 'path2', 'path3', 'path4'];
                         newPath = entryPaths[Math.floor(Math.random() * entryPaths.length)];
                         newProgress = 0; // Start from beginning of new path
                    }
                     return { ...train, path: newPath, progress: newProgress - 1 };
                }

                return { ...train, progress: newProgress, path: newPath };
            })
        );
    }, []);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(advanceSimulation, 100); // Update every 100ms

        return () => clearInterval(interval);
    }, [isRunning, advanceSimulation]);

    const reset = useCallback(() => {
        setTrains(JSON.parse(JSON.stringify(initialTrains)));
        if (!isRunning) {
             // to make it visible in paused state
             setTimeout(() => setTrains(JSON.parse(JSON.stringify(initialTrains))), 0);
        }
    }, [isRunning]);

    const step = useCallback(() => {
        if (!isRunning) {
            advanceSimulation();
        }
    }, [isRunning, advanceSimulation]);


    return { trains, setTrains, isRunning, setIsRunning, reset, step };
};
