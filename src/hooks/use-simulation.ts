import { useState, useEffect, useCallback, useRef } from 'react';
import { simulationCases } from '@/lib/simulation-cases';
import { allTrains as staticTrainData } from '@/lib/data';

export type Train = {
    id: string;
    track: string;
    position: number; // current mile
    speed: number;    // current speed in mph
    status: 'on-time' | 'delayed' | 'stopped' | 'slowing' | 'in-siding' | 'at-platform' | 'finished';
    
    // Static properties from case definition
    baseSpeed: number;
    priority: 'high' | 'low';
    startTime: number; // minutes past 7:00 PM
    platformHaltDuration: number; // minutes
    cargo: string | null;
    path: string[]; // sequence of track IDs
    
    // Dynamic state
    haltTimer: number; // minutes remaining for halt
    hasHaltedAtPlatform: boolean;
    currentPathIndex: number;
    totalDelay: number;
    completionTime: number | null;
};

export type SimulationMetrics = {
    throughput: number;
    avgDelay: number;
    efficiency: number;
}

// Simulation constants
const TIME_STEP_S = 10; // Each tick is 10 seconds of simulation time
const SECTION_LENGTH_MI = 20;
const SIDING_HALT_DURATION_MIN = 5;
const HEADWAY_MIN = 5;


export const useSimulation = (caseId: string) => {
    const simCase = simulationCases[caseId];
    if (!simCase) throw new Error(`Simulation case ${caseId} not found.`);
    
    const initializeTrains = useCallback(() => {
        return JSON.parse(JSON.stringify(simCase.initialTrains.map(t => ({
            ...t, 
            id: t.id,
            position: -1, 
            speed: 0, 
            status: 'on-time', 
            haltTimer: 0, 
            hasHaltedAtPlatform: false,
            track: t.path[0],
            currentPathIndex: 0,
            totalDelay: 0,
            completionTime: null,
        }))));
    }, [simCase.initialTrains]);

    const [trains, setTrains] = useState<Train[]>(initializeTrains);
    const [isRunning, setIsRunning] = useState(true);
    const [simulationSpeed, setSimulationSpeed] = useState(1);
    const [simulationTime, setSimulationTime] = useState(0); // in minutes
    const [metrics, setMetrics] = useState<SimulationMetrics>({ throughput: 0, avgDelay: 0, efficiency: 0 });
    
    const simulationSpeedRef = useRef(simulationSpeed);
    simulationSpeedRef.current = simulationSpeed;

    useEffect(() => {
        setTrains(initializeTrains());
        setSimulationTime(0);
        setIsRunning(true);
        setMetrics({ throughput: 0, avgDelay: 0, efficiency: 0 });
    }, [caseId, initializeTrains]);


    const advanceSimulation = useCallback(() => {
        const timeDeltaMin = (TIME_STEP_S / 60) * simulationSpeedRef.current;
        const newSimTime = simulationTime + timeDeltaMin;
        setSimulationTime(newSimTime);
        
        setTrains(currentTrains => {
            let newTrains = JSON.parse(JSON.stringify(currentTrains));

            for (let i = 0; i < newTrains.length; i++) {
                const train = newTrains[i];

                if (train.status === 'finished') continue;
                
                const actualStartTime = train.startTime + (simCase.initialTrains.find(t=>t.id === train.id)?.delay || 0);

                if (train.position < 0 && newSimTime >= actualStartTime) {
                    const entryPoint = simCase.layout.points[simCase.layout.tracks[train.track].points[0]];
                    train.position = entryPoint.mile;
                    train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                    train.status = 'on-time';
                }
                if (train.position < 0) continue;

                if (train.haltTimer > 0) {
                    train.haltTimer -= timeDeltaMin;
                    if (train.haltTimer <= 0) {
                        train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                        train.status = 'on-time';
                        train.haltTimer = 0;
                    } else {
                        train.speed = 0;
                        train.totalDelay += timeDeltaMin;
                        continue; 
                    }
                }
                
                // --- Path switching logic ---
                const currentTrackId = train.track;
                const currentTrackLayout = simCase.layout.tracks[currentTrackId];
                if (currentTrackLayout) {
                    const toPoint = simCase.layout.points[currentTrackLayout.points[1]];
                    const trackEndMile = toPoint.mile;
    
                    if (toPoint && train.position >= trackEndMile && train.currentPathIndex < train.path.length - 1) {
                        train.currentPathIndex++;
                        const nextTrackId = train.path[train.currentPathIndex];
                        const nextTrackLayout = simCase.layout.tracks[nextTrackId];
                        if (nextTrackLayout) {
                            train.track = nextTrackId;
                            const fromPointNextTrack = simCase.layout.points[nextTrackLayout.points[0]];
                            train.position = fromPointNextTrack.mile;
                        }
                    }
                }
                
                const currentPoint = simCase.layout.points[simCase.layout.tracks[train.track]?.points[1]];
                if (currentPoint?.isPlatform && !train.hasHaltedAtPlatform && Math.abs(train.position - currentPoint.mile) < 0.2) {
                    train.status = 'at-platform';
                    train.haltTimer = train.platformHaltDuration;
                    train.hasHaltedAtPlatform = true;
                    train.speed = 0;
                    continue;
                }

                let newSpeed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                let newStatus: Train['status'] = train.status === 'at-platform' || train.status === 'in-siding' ? train.status : 'on-time';
                
                // --- Headway and Conflict Logic ---
                let leadTrainDistance = Infinity;

                for (let j = 0; j < newTrains.length; j++) {
                    if (i === j || newTrains[j].status === 'finished') continue;
                    const otherTrain = newTrains[j];
                    if (otherTrain.track === train.track && otherTrain.position > train.position) {
                        leadTrainDistance = Math.min(leadTrainDistance, otherTrain.position - train.position);
                    }
                }
                
                const headwayDistance = (train.baseSpeed / 60) * HEADWAY_MIN;
                const stoppingDistance = headwayDistance * 2; // Increased distance
                const slowingDistance = headwayDistance * 3; // Increased distance

                if (leadTrainDistance < stoppingDistance) {
                    newSpeed = 0;
                    newStatus = 'stopped';
                } else if (leadTrainDistance < slowingDistance) {
                    newSpeed = train.baseSpeed * (leadTrainDistance / slowingDistance);
                    newStatus = 'slowing';
                }

                const sidingPoint = Object.values(simCase.layout.points).find(p => p.label === 'S');
                if (sidingPoint && train.priority === 'low') {
                    const highPriorityConflict = newTrains.find(t => 
                        t.priority === 'high' && 
                        t.track === train.track &&
                        t.position < train.position + slowingDistance &&
                        t.position > train.position - stoppingDistance
                    );

                    if (highPriorityConflict && Math.abs(train.position - sidingPoint.mile) < 1 && train.status !== 'in-siding') {
                        const extraHalt = simCase.initialTrains.find(t=>t.id === train.id)?.sidingHaltDuration || SIDING_HALT_DURATION_MIN;
                        train.status = 'in-siding';
                        train.haltTimer = extraHalt;
                        newSpeed = 0;
                        train.position = sidingPoint.mile;
                    }
                }


                if (newStatus === 'stopped' || newStatus === 'slowing') {
                    train.totalDelay += timeDeltaMin;
                }

                train.speed = newSpeed;
                if(newStatus !== train.status && train.status !== 'at-platform' && train.status !== 'in-siding') {
                    train.status = newStatus;
                }
                
                const distanceMoved = train.speed * (TIME_STEP_S / 3600);
                train.position += distanceMoved * simulationSpeedRef.current;

                const exitPoints = Object.values(simCase.layout.points).filter(p => p.label?.startsWith('S') && p.mile > 0);
                if (exitPoints.some(p => Math.abs(p.mile - train.position) < 0.5)) {
                    train.status = 'finished';
                    train.speed = 0;
                    train.completionTime = newSimTime;
                }


                newTrains[i] = train;
            }

            return newTrains;
        });

        // --- Calculate metrics ---
        const finishedTrains = trains.filter(t => t.status === 'finished');
        const activeTrains = trains.filter(t => t.position > -1 && t.status !== 'finished');
        
        const totalDelay = activeTrains.reduce((acc, t) => acc + t.totalDelay, 0) + finishedTrains.reduce((acc, t) => acc + t.totalDelay, 0);
        const avgDelay = (activeTrains.length + finishedTrains.length) > 0 ? totalDelay / (activeTrains.length + finishedTrains.length) : 0;
        
        // Throughput: trains finished per hour
        const firstStartTime = Math.min(...simCase.initialTrains.map(t => t.startTime).filter(t => t !== undefined));
        const timeWindowHours = Math.max(newSimTime - firstStartTime, 1) / 60;
        const throughput = finishedTrains.length / timeWindowHours;

        // Efficiency: Actual vs theoretical minimum time
        const idealTime = trains.reduce((acc, train) => {
            if (train.position > -1) {
                const idealCrossTime = (SECTION_LENGTH_MI / train.baseSpeed) * 60 + train.platformHaltDuration;
                return acc + idealCrossTime;
            }
            return acc;
        }, 0);
        
        const actualTime = trains.reduce((acc, train) => {
            if (train.position > -1 && train.status !== 'finished') {
                return acc + (newSimTime - train.startTime);
            }
            if (train.completionTime) {
                return acc + (train.completionTime - train.startTime);
            }
            return acc;
        }, 0);
        
        let efficiency = (idealTime > 0 && actualTime > 0) ? idealTime / actualTime : 0;
        efficiency = Math.min(efficiency, 1); // Cap efficiency at 100%

        setMetrics({
            throughput: parseFloat(throughput.toFixed(1)),
            avgDelay: parseFloat(avgDelay.toFixed(1)),
            efficiency: parseFloat(efficiency.toFixed(2)),
        });

    }, [caseId, simCase, simulationTime, trains]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(advanceSimulation, 100);

        return () => clearInterval(interval);
    }, [isRunning, advanceSimulation]);

    const reset = useCallback(() => {
        setIsRunning(false);
        setTrains(initializeTrains());
        setSimulationTime(0);
        setMetrics({ throughput: 0, avgDelay: 0, efficiency: 0 });
    }, [initializeTrains]);

    const step = useCallback(() => {
        if (!isRunning) {
            advanceSimulation();
        }
    }, [isRunning, advanceSimulation]);

    return { trains, isRunning, setIsRunning, reset, step, simulationSpeed, setSimulationSpeed, simulationTime, metrics };
};
