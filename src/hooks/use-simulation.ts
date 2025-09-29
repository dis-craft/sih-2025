import { useState, useEffect, useCallback } from 'react';

type TrainStatus = 'on-time' | 'delayed' | 'stopped' | 'slowing' | 'conflict';

export type Train = {
    id: string;
    type: 'express' | 'passenger' | 'freight' | 'emergency';
    path: string;
    progress: number; 
    speed: number; // Current speed in progress/sec
    maxSpeed: number; // Max speed in progress/sec
    status: TrainStatus;
};

const initialTrains: Train[] = [
    { id: 'T12613', type: 'express', path: 'approach1', progress: 0.1, speed: 0.015, maxSpeed: 0.015, status: 'on-time' },
    { id: 'T16216', type: 'passenger', path: 'approach2', progress: 0.3, speed: 0.01, maxSpeed: 0.01, status: 'on-time' },
    { id: 'T20660', type: 'express', path: 'platform3', progress: 0.5, speed: 0.015, maxSpeed: 0.015, status: 'on-time' },
    { id: 'F5678', type: 'freight', path: 'platform4', progress: 0.8, speed: 0.007, maxSpeed: 0.007, status: 'on-time' },
    { id: 'E901', type: 'emergency', path: 'approach-ext', progress: 0.2, speed: 0.02, maxSpeed: 0.02, status: 'on-time' },

];


export const useSimulation = () => {
    const [trains, setTrains] = useState<Train[]>(() => JSON.parse(JSON.stringify(initialTrains)));
    const [isRunning, setIsRunning] = useState(true);

    const advanceSimulation = useCallback(() => {
        setTrains(currentTrains => {
            const newTrains = [...currentTrains];

            for (let i = 0; i < newTrains.length; i++) {
                const train = newTrains[i];
                let nextPath = train.path;
                let newProgress = train.progress + train.speed;

                // --- Path Transition Logic ---
                if (newProgress >= 1) {
                    newProgress = 0; // Reset progress for the new path
                    switch (train.path) {
                        case 'approach-ext': nextPath = 'approach1'; break;
                        case 'approach1': nextPath = 'platform1'; break;
                        case 'approach2': nextPath = 'platform2'; break;
                        case 'platform1': nextPath = 'exit1'; break;
                        case 'platform2': nextPath = 'exit1'; break;
                        case 'platform3': nextPath = 'exit2'; break;
                        case 'platform4': nextPath = 'exit2'; break;
                        case 'exit1': nextPath = 'exit-ext'; break;
                        case 'exit2': nextPath = 'exit-ext'; break;
                        case 'exit-ext': // Loop back to start for continuous simulation
                            const entryPaths = ['approach-ext', 'approach2'];
                            nextPath = entryPaths[Math.floor(Math.random() * entryPaths.length)];
                            break;
                    }
                }

                // --- Collision Avoidance / Signaling Logic ---
                let leadTrainDistance = Infinity;
                let newSpeed = train.maxSpeed;
                let newStatus: TrainStatus = 'on-time';

                for (let j = 0; j < newTrains.length; j++) {
                    if (i === j) continue;
                    const otherTrain = newTrains[j];
                    
                    // Check for trains on the same path or a conflicting subsequent path
                    if (otherTrain.path === train.path && otherTrain.progress > train.progress) {
                        leadTrainDistance = Math.min(leadTrainDistance, otherTrain.progress - train.progress);
                    }
                    if(otherTrain.path === nextPath && train.path !== nextPath){
                        leadTrainDistance = Math.min(leadTrainDistance, (1 - train.progress) + otherTrain.progress);
                    }
                }
                
                const stoppingDistance = 0.2; // 20% of the track length
                const slowingDistance = 0.4;  // 40% of the track length

                if (leadTrainDistance < stoppingDistance) {
                    newSpeed = 0;
                    newStatus = 'stopped';
                } else if (leadTrainDistance < slowingDistance) {
                    // Simple proportional speed reduction
                    newSpeed = train.maxSpeed * (leadTrainDistance / slowingDistance);
                    newStatus = 'slowing';
                }

                // Update train properties
                newTrains[i] = { ...train, path: nextPath, progress: newProgress, speed: newSpeed, status: newStatus };
            }

            return newTrains;
        });
    }, []);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(advanceSimulation, 100);

        return () => clearInterval(interval);
    }, [isRunning, advanceSimulation]);

    const reset = useCallback(() => {
        setIsRunning(false);
        setTrains(JSON.parse(JSON.stringify(initialTrains)));
    }, []);

    const step = useCallback(() => {
        if (!isRunning) {
            advanceSimulation();
        }
    }, [isRunning, advanceSimulation]);

    return { trains, isRunning, setIsRunning, reset, step };
};
