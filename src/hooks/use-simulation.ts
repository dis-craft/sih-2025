import { useState, useEffect, useCallback, useRef } from 'react';
import { simulationCases } from '@/lib/simulation-cases';

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

export const useSimulation = (caseId: string) => {
    const simCase = simulationCases[caseId];
    const initialTrains = simCase ? simCase.initialTrains : [];
    const layout = simCase ? simCase.layout : { paths: {}, points: {} };

    const [trains, setTrains] = useState<Train[]>(() => JSON.parse(JSON.stringify(initialTrains)));
    const [isRunning, setIsRunning] = useState(true);
    const [simulationSpeed, setSimulationSpeed] = useState(1);
    const simulationSpeedRef = useRef(simulationSpeed);
    simulationSpeedRef.current = simulationSpeed;

    useEffect(() => {
        // Reset state when caseId changes
        setTrains(JSON.parse(JSON.stringify(initialTrains)));
        setIsRunning(true);
    }, [caseId, initialTrains]);


    const advanceSimulation = useCallback(() => {
        setTrains(currentTrains => {
            const newTrains = [...currentTrains];

            for (let i = 0; i < newTrains.length; i++) {
                const train = newTrains[i];
                let nextPath = train.path;
                let newProgress = train.progress + (train.speed * simulationSpeedRef.current);

                if (newProgress >= 1) {
                    newProgress = newProgress % 1; 
                    const currentPathConnections = layout.paths[train.path];
                    const destinationNode = currentPathConnections ? currentPathConnections[1] : null;
                    
                    const possibleNextPaths = Object.entries(layout.paths)
                        .filter(([pathName, nodes]) => nodes[0] === destinationNode)
                        .map(([pathName]) => pathName);

                    if (possibleNextPaths.length > 0) {
                        nextPath = possibleNextPaths[Math.floor(Math.random() * possibleNextPaths.length)];
                    } else {
                        const entryPaths = Object.keys(layout.paths);
                        nextPath = entryPaths[Math.floor(Math.random() * entryPaths.length)];
                    }
                }

                // --- Collision Avoidance / Signaling Logic ---
                let leadTrainDistance = Infinity;
                let newSpeed = train.maxSpeed;
                let newStatus: TrainStatus = 'on-time';

                for (let j = 0; j < newTrains.length; j++) {
                    if (i === j) continue;
                    const otherTrain = newTrains[j];
                    
                    if (otherTrain.path === train.path && otherTrain.progress > train.progress) {
                        leadTrainDistance = Math.min(leadTrainDistance, otherTrain.progress - train.progress);
                    }
                    if(otherTrain.path === nextPath && train.path !== nextPath){
                        const distanceToPathEnd = 1 - train.progress;
                        leadTrainDistance = Math.min(leadTrainDistance, distanceToPathEnd + otherTrain.progress);
                    }
                }
                
                const stoppingDistance = 0.4;
                const slowingDistance = 0.8;

                if (leadTrainDistance < stoppingDistance) {
                    newSpeed = 0;
                    newStatus = 'stopped';
                } else if (leadTrainDistance < slowingDistance) {
                    newSpeed = train.maxSpeed * ((leadTrainDistance - stoppingDistance) / (slowingDistance - stoppingDistance));
                    newStatus = 'slowing';
                } else {
                    newSpeed = train.maxSpeed;
                    newStatus = 'on-time';
                }
                
                newSpeed = Math.max(0, newSpeed);


                newTrains[i] = { ...train, path: nextPath, progress: newProgress, speed: newSpeed, status: newStatus };
            }

            return newTrains;
        });
    }, [layout]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(advanceSimulation, 100);

        return () => clearInterval(interval);
    }, [isRunning, advanceSimulation]);

    const reset = useCallback(() => {
        setIsRunning(false);
        setTrains(JSON.parse(JSON.stringify(initialTrains)));
    }, [initialTrains]);

    const step = useCallback(() => {
        if (!isRunning) {
            advanceSimulation();
        }
    }, [isRunning, advanceSimulation]);

    return { trains, isRunning, setIsRunning, reset, step, simulationSpeed, setSimulationSpeed };
};
