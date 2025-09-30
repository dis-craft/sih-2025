'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { simulationCases } from '@/lib/simulation-cases';
import { allTrains as staticTrainData } from '@/lib/data';

export type Train = {
    id: string;
    track: string;
    position: number; // current mile
    speed: number;    // current speed in mph
    status: 'on-time' | 'delayed' | 'stopped' | 'slowing' | 'in-siding' | 'at-platform' | 'finished' | 'breakdown';
    
    // Static properties from case definition
    baseSpeed: number;
    priority: 'high' | 'medium' | 'low';
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
    scheduledArrivalTime: number;
    conflictTime: number; // time spent resolving conflicts
    breakdownDuration: number; // minutes
};

export type SimulationMetrics = {
    throughput: number;
    avgDelay: number;
    efficiency: number;
    totalDelay: number;
    punctualityRate: number;
    trackUtilization: number;
    platformOccupancy: number;
    conflictResolutionTime: number;
    safetyComplianceRate: number;
    priorityAdherence: number;
}

// Simulation constants
const TIME_STEP_S = 10; // Each tick is 10 seconds of simulation time
const SECTION_LENGTH_MI = 20;
const SIDING_HALT_DURATION_MIN = 5;
const HEADWAY_MIN = 5;


export const useSimulation = (caseId: string) => {
    const simCase = simulationCases[caseId];
    if (!simCase) throw new Error(`Simulation case ${caseId} not found.`);
    
    const initializeTrains = useCallback((): Train[] => {
        return JSON.parse(JSON.stringify(simCase.initialTrains.map(t => {
            const idealCrossTime = (SECTION_LENGTH_MI / t.baseSpeed!) * 60;
            return {
                ...t, 
                id: t.id,
                position: -1, 
                speed: 0, 
                status: 'on-time', 
                haltTimer: 0, 
                hasHaltedAtPlatform: false,
                track: t.path![0],
                currentPathIndex: 0,
                totalDelay: 0,
                completionTime: null,
                scheduledArrivalTime: t.startTime! + idealCrossTime + t.platformHaltDuration!,
                conflictTime: 0,
                breakdownDuration: t.breakdownDuration || 0,
                priority: t.priority,
            }
        })));
    }, [simCase]);

    const [trains, setTrains] = useState<Train[]>(initializeTrains);
    const [isRunning, setIsRunning] = useState(true);
    const [simulationSpeed, setSimulationSpeed] = useState(1);
    const [simulationTime, setSimulationTime] = useState(0); // in minutes
    
    const initialMetrics: SimulationMetrics = { 
        throughput: 0, avgDelay: 0, efficiency: 0, totalDelay: 0, punctualityRate: 100, 
        trackUtilization: 0, platformOccupancy: 0, conflictResolutionTime: 0, 
        safetyComplianceRate: 100, priorityAdherence: 100
    };
    const [metrics, setMetrics] = useState<SimulationMetrics>(initialMetrics);
    
    const simulationSpeedRef = useRef(simulationSpeed);
    simulationSpeedRef.current = simulationSpeed;

    const isRunningRef = useRef(isRunning);
    isRunningRef.current = isRunning;
    
    const priorityConflictsResolved = useRef(0);
    const totalPriorityDecisions = useRef(0);


    useEffect(() => {
        setTrains(initializeTrains());
        setSimulationTime(0);
        setIsRunning(true);
        setMetrics(initialMetrics);
        priorityConflictsResolved.current = 0;
        totalPriorityDecisions.current = 0;
    }, [caseId, initializeTrains]);


    const advanceSimulation = useCallback(() => {
        setSimulationTime(prevTime => {
            const timeDeltaMin = TIME_STEP_S / 60; // time progression per tick
            const newSimTime = prevTime + timeDeltaMin;

            setTrains(currentTrains => {
                let newTrains: Train[] = JSON.parse(JSON.stringify(currentTrains));

                for (let i = 0; i < newTrains.length; i++) {
                    const train = newTrains[i];

                    if (train.status === 'finished') continue;

                    // Handle breakdowns
                    if (train.breakdownDuration > 0 && newSimTime >= (train.startTime + 5) && train.status !== 'breakdown') { // simplified trigger
                        train.status = 'breakdown';
                        train.speed = 0;
                    }
                    if (train.status === 'breakdown') {
                        train.breakdownDuration -= timeDeltaMin;
                        train.totalDelay += timeDeltaMin;
                        if (train.breakdownDuration <= 0) {
                            train.status = 'on-time';
                        } else {
                            continue;
                        }
                    }
                    
                    const actualStartTime = train.startTime + (simCase.initialTrains.find(t=>t.id === train.id)?.delay || 0);

                    if (train.position < 0 && newSimTime >= actualStartTime) {
                        const trackLayout = simCase.layout.tracks[train.track];
                        if (!trackLayout) {
                            console.error(`Train ${train.id} has an invalid starting track: ${train.track}`);
                            continue;
                        }
                        const entryPoint = simCase.layout.points[trackLayout.points[0]];
                        train.position = entryPoint.mile;
                        train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                        train.status = 'on-time';
                    }
                    if (train.position < 0) continue;

                    if (train.haltTimer > 0) {
                        train.haltTimer -= timeDeltaMin;
                        const conflictHalt = train.status === 'in-siding';
                        if (conflictHalt) train.conflictTime += timeDeltaMin;
                        train.totalDelay += timeDeltaMin;

                        if (train.haltTimer <= 0) {
                            train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                            train.status = 'on-time';
                            train.haltTimer = 0;
                        } else {
                            train.speed = 0;
                            continue; 
                        }
                    }
                    
                    // --- Path switching logic ---
                    const currentTrackId = train.track;
                    const currentTrackLayout = simCase.layout.tracks[currentTrackId];
                    if (currentTrackLayout) {
                        const toPointId = currentTrackLayout.points[1];
                        const toPoint = simCase.layout.points[toPointId];

                        if (toPoint && Math.abs(train.position - toPoint.mile) < 0.1 && train.currentPathIndex < train.path.length - 1) {
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
                    
                    const currentPoint = Object.values(simCase.layout.points).find(p => p.isPlatform && Math.abs(train.position - p.mile) < 0.2);
                    if (currentPoint && !train.hasHaltedAtPlatform) {
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
                    let conflictDetected = false;

                    for (let j = 0; j < newTrains.length; j++) {
                        if (i === j || newTrains[j].status === 'finished') continue;
                        
                        const otherTrain = newTrains[j];
                        
                        // Check for headway on the same track
                        if (otherTrain.track === train.track && otherTrain.position > train.position) {
                            leadTrainDistance = Math.min(leadTrainDistance, otherTrain.position - train.position);
                        }
                        
                        // Check for breakdown blockage
                        if (newTrains[j].status === 'breakdown' && newTrains[j].track === train.track && newTrains[j].position > train.position) {
                            leadTrainDistance = Math.min(leadTrainDistance, newTrains[j].position - train.position);
                        }
                    }
                    
                    const headwayDistance = (HEADWAY_MIN / 60) * train.baseSpeed;
                    const stoppingDistance = headwayDistance * 0.5;
                    const slowingDistance = headwayDistance * 1.5;

                    if (leadTrainDistance < stoppingDistance) {
                        newSpeed = 0;
                        newStatus = 'stopped';
                        conflictDetected = true;
                    } else if (leadTrainDistance < slowingDistance) {
                        newSpeed = Math.max(0, train.baseSpeed * (leadTrainDistance / slowingDistance));
                        newStatus = 'slowing';
                        conflictDetected = true;
                    }
                    
                    // Siding logic for low priority trains
                    const sidingPoints = Object.values(simCase.layout.points).filter(p => p.label?.includes('Siding'));
                    if (sidingPoints.length > 0 && train.priority === 'low') {
                        const highPriorityConflict = newTrains.find(t => 
                            t.priority === 'high' && 
                            t.track === train.track &&
                            t.position > train.position &&
                            (t.position - train.position) < slowingDistance * 2
                        );

                        const sidingPoint = sidingPoints[0]; // Simplification for now
                        if (highPriorityConflict && Math.abs(train.position - sidingPoint.mile) < 1 && train.status !== 'in-siding') {
                            totalPriorityDecisions.current++;
                            if(highPriorityConflict.priority !== train.priority) {
                               priorityConflictsResolved.current++;
                            }
                            const extraHalt = simCase.initialTrains.find(t=>t.id === train.id)?.sidingHaltDuration || SIDING_HALT_DURATION_MIN;
                            train.status = 'in-siding';
                            train.haltTimer = extraHalt;
                            newSpeed = 0;
                            train.position = sidingPoint.mile;
                            conflictDetected = true;
                        }
                    }


                    if (conflictDetected) {
                        train.conflictTime += timeDeltaMin;
                    }
                    if (newStatus === 'stopped' || newStatus === 'slowing') {
                        train.totalDelay += timeDeltaMin;
                    }

                    train.speed = newSpeed;
                    if(!['at-platform', 'in-siding', 'breakdown'].includes(train.status)) {
                        train.status = newStatus;
                    }
                    
                    const distanceMoved = train.speed * (timeDeltaMin / 60);
                    train.position += distanceMoved;

                    const exitPoints = Object.values(simCase.layout.points).filter(p => p.label?.startsWith('E_') || p.label?.startsWith('SL_'));
                    if (exitPoints.some(p => Math.abs(p.mile - train.position) < 0.5 && p.mile >= SECTION_LENGTH_MI - 0.5 )) {
                        train.status = 'finished';
                        train.speed = 0;
                        train.completionTime = newSimTime;
                    }


                    newTrains[i] = train;
                }

                // --- Calculate metrics ---
                const finishedTrains = newTrains.filter(t => t.status === 'finished');
                const activeTrains = newTrains.filter(t => t.position > -1);
                if (activeTrains.length > 0) {
                    const totalDelay = activeTrains.reduce((acc, t) => acc + t.totalDelay, 0);
                    const avgDelay = totalDelay / activeTrains.length;
                    
                    const timeWindowHours = Math.max(newSimTime - newTrains[0].startTime, 1) / 60;
                    const throughput = finishedTrains.length / timeWindowHours;

                    const idealTime = activeTrains.reduce((acc, t) => acc + (SECTION_LENGTH_MI / t.baseSpeed) * 60 + t.platformHaltDuration, 0);
                    const actualTime = activeTrains.reduce((acc, t) => t.completionTime ? acc + (t.completionTime - t.startTime) : acc + (newSimTime - t.startTime), 0);
                    const efficiency = (idealTime > 0 && actualTime > 0) ? Math.min(idealTime / actualTime, 1) : 0;
                    
                    const punctualTrains = finishedTrains.filter(t => t.completionTime! <= t.scheduledArrivalTime + 5).length;
                    const punctualityRate = finishedTrains.length > 0 ? (punctualTrains / finishedTrains.length) * 100 : 100;
                    
                    const totalTrackTime = newSimTime * Object.keys(simCase.layout.tracks).length * SECTION_LENGTH_MI;
                    const occupiedTrackTime = activeTrains.reduce((acc, t) => acc + (t.speed > 0 ? timeDeltaMin * SECTION_LENGTH_MI : 0), 0);
                    const trackUtilization = totalTrackTime > 0 ? (occupiedTrackTime / totalTrackTime) * 100 * 50 : 0; // *50 fudge factor

                    const totalPlatformTime = newSimTime * Object.values(simCase.layout.points).filter(p=>p.isPlatform).length;
                    const occupiedPlatformTime = activeTrains.reduce((acc, t) => acc + (t.status === 'at-platform' ? timeDeltaMin : 0), 0);
                    const platformOccupancy = totalPlatformTime > 0 ? (occupiedPlatformTime / totalPlatformTime) * 100 : 0;

                    const conflictResolutionTime = activeTrains.reduce((acc, t) => acc + t.conflictTime, 0);
                    const priorityAdherence = totalPriorityDecisions.current > 0 ? (priorityConflictsResolved.current / totalPriorityDecisions.current) * 100 : 100;

                    setMetrics({
                        throughput: parseFloat(throughput.toFixed(1)),
                        avgDelay: parseFloat(avgDelay.toFixed(1)),
                        efficiency: parseFloat(efficiency.toFixed(2)) * 100,
                        totalDelay: parseFloat(totalDelay.toFixed(1)),
                        punctualityRate: parseFloat(punctualityRate.toFixed(0)),
                        trackUtilization: parseFloat(trackUtilization.toFixed(0)),
                        platformOccupancy: parseFloat(platformOccupancy.toFixed(0)),
                        conflictResolutionTime: parseFloat(conflictResolutionTime.toFixed(1)),
                        safetyComplianceRate: 99, // Mock value
                        priorityAdherence: parseFloat(priorityAdherence.toFixed(0)),
                    });
                }

                return newTrains;
            });
            return newSimTime;
        });
    }, [caseId, simCase]);

    useEffect(() => {
        if (!isRunning) return;

        // The interval delay is now dependent on the simulation speed
        const intervalDelay = 100 / simulationSpeedRef.current;
        const interval = setInterval(advanceSimulation, intervalDelay);

        return () => clearInterval(interval);
    }, [isRunning, advanceSimulation]);


    const reset = useCallback(() => {
        setIsRunning(false);
        setTrains(initializeTrains());
        setSimulationTime(0);
        setMetrics(initialMetrics);
        priorityConflictsResolved.current = 0;
        totalPriorityDecisions.current = 0;
        setTimeout(() => setIsRunning(true), 100);
    }, [initializeTrains]);

    const step = useCallback(() => {
        if (!isRunning) {
            advanceSimulation();
        }
    }, [isRunning, advanceSimulation]);
    
    // This effect handles the simulation loop itself
    useEffect(() => {
        let lastTime = performance.now();
        let animationFrameId: number;

        const gameLoop = (currentTime: number) => {
            const deltaTime = (currentTime - lastTime);
            lastTime = currentTime;
            
            if (isRunningRef.current) {
                // The simulation logic is now called inside requestAnimationFrame
                // but the time progression is controlled by simulationSpeed state
            }
            // advanceSimulation is now called via setInterval, so we don't call it here
            animationFrameId = requestAnimationFrame(gameLoop);
        };
        
        // animationFrameId = requestAnimationFrame(gameLoop);

        // return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // New function to handle speed changes from the slider
    const handleSpeedChange = (speed: number) => {
        setSimulationSpeed(speed);
    };

    return { trains, isRunning, setIsRunning, reset, step, simulationSpeed, setSimulationSpeed: handleSpeedChange, simulationTime, metrics };
};
