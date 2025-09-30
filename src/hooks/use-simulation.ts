'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { create } from 'zustand';
import { simulationCases } from '@/lib/simulation-cases';
import { allTrains as staticTrainData } from '@/lib/data';

export type Train = {
    id: string;
    track: string;
    position: number; // current mile
    speed: number;    // current speed in mph
    status: 'on-time' | 'delayed' | 'stopped' | 'slowing' | 'in-siding' | 'at-platform' | 'finished' | 'breakdown' | 'awaiting_approval';
    
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
    approvalState: 'pending' | 'approved' | 'rejected';
    decisionPointId?: string; 
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

export type ApprovalRequest = {
    trainId: string;
    decisionPointId: string;
    possiblePaths: string[][];
};

// Simulation constants
const TIME_STEP_S = 10; // Each tick is 10 seconds of simulation time
const SECTION_LENGTH_MI = 20;
const SIDING_HALT_DURATION_MIN = 5;
const HEADWAY_MIN = 5;
const APPROVAL_HALT_S = 2;


const useSimulationStore = create<{
    trains: Train[];
    isRunning: boolean;
    simulationSpeed: number;
    simulationTime: number;
    metrics: SimulationMetrics;
    approvalRequest: ApprovalRequest | null;
    caseId: string;
    setCaseId: (caseId: string) => void;
    setTrains: (trains: Train[]) => void;
    setIsRunning: (isRunning: boolean) => void;
    setSimulationTime: (time: number) => void;
    setSimulationSpeed: (speed: number) => void;
    setMetrics: (metrics: SimulationMetrics) => void;
    setApprovalRequest: (req: ApprovalRequest | null) => void;
}>((set) => ({
    trains: [],
    isRunning: true,
    simulationSpeed: 1,
    simulationTime: 0,
    metrics: { 
        throughput: 0, avgDelay: 0, efficiency: 0, totalDelay: 0, punctualityRate: 100, 
        trackUtilization: 0, platformOccupancy: 0, conflictResolutionTime: 0, 
        safetyComplianceRate: 100, priorityAdherence: 100
    },
    approvalRequest: null,
    caseId: 'case1',
    setCaseId: (caseId) => set({ caseId }),
    setTrains: (trains) => set({ trains }),
    setIsRunning: (isRunning) => set({ isRunning }),
    setSimulationTime: (time) => set({ simulationTime: time }),
    setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
    setMetrics: (metrics) => set({ metrics }),
    setApprovalRequest: (req) => set({ approvalRequest: req }),
}));

export const useSimulation = (caseId?: string) => {
    const store = useSimulationStore();
    const caseIdToUse = caseId || store.caseId;
    const simCase = simulationCases[caseIdToUse];
    if (!simCase) throw new Error(`Simulation case ${caseIdToUse} not found.`);

    const {
        trains, setTrains,
        isRunning, setIsRunning,
        simulationSpeed, setSimulationSpeed,
        simulationTime, setSimulationTime,
        metrics, setMetrics,
        approvalRequest, setApprovalRequest,
    } = store;
    
    const initializeTrains = useCallback((): Train[] => {
        return JSON.parse(JSON.stringify(simCase.initialTrains.map(t => {
            const idealCrossTime = (SECTION_LENGTH_MI / t.baseSpeed!) * 60;
            return {
                ...t, 
                id: t.id,
                position: -1, 
                speed: 0, 
                status: 'awaiting_approval', 
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
                approvalState: 'pending',
                decisionPointId: 'start_approval',
            }
        })));
    }, [simCase]);

    const initialMetrics: SimulationMetrics = { 
        throughput: 0, avgDelay: 0, efficiency: 0, totalDelay: 0, punctualityRate: 100, 
        trackUtilization: 0, platformOccupancy: 0, conflictResolutionTime: 0, 
        safetyComplianceRate: 100, priorityAdherence: 100
    };
    
    const simulationSpeedRef = useRef(simulationSpeed);
    simulationSpeedRef.current = simulationSpeed;

    const isRunningRef = useRef(isRunning);
    isRunningRef.current = isRunning;
    
    const priorityConflictsResolved = useRef(0);
    const totalPriorityDecisions = useRef(0);


    useEffect(() => {
        if (caseId) {
            useSimulationStore.setState({ caseId });
            setTrains(initializeTrains());
            setSimulationTime(0);
            setIsRunning(true);
            setMetrics(initialMetrics);
            setApprovalRequest(null);
            priorityConflictsResolved.current = 0;
            totalPriorityDecisions.current = 0;
        }
    }, [caseId, initializeTrains, setTrains, setSimulationTime, setIsRunning, setMetrics, setApprovalRequest]);


    const advanceSimulation = useCallback(() => {
        setSimulationTime(prevTime => {
            const timeDeltaMin = TIME_STEP_S / 60; // time progression per tick
            const newSimTime = prevTime + timeDeltaMin;

            setTrains(currentTrains => {
                let newTrains: Train[] = JSON.parse(JSON.stringify(currentTrains));

                for (let i = 0; i < newTrains.length; i++) {
                    const train = newTrains[i];

                    // --- Initial Approval Logic ---
                    if (train.approvalState === 'pending' && newSimTime >= train.startTime + (APPROVAL_HALT_S / 60)) {
                         if (!approvalRequest || approvalRequest.trainId !== train.id) {
                            train.status = 'awaiting_approval';
                            train.speed = 0;
                            setApprovalRequest({ trainId: train.id, decisionPointId: 'start_approval', possiblePaths: [train.path] });
                        }
                        continue; // Wait for approval
                    }

                    if (train.status === 'finished' || train.approvalState !== 'approved' || train.status === 'awaiting_approval') continue;
                    
                    const currentTrackLayout = simCase.layout.tracks[train.track];
                    if (!currentTrackLayout) {
                        console.warn(`Train ${train.id} has an invalid track ID: ${train.track}. Skipping.`);
                        continue;
                    }

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

                    if (train.position < 0) continue;


                    if (train.haltTimer > 0) {
                        train.haltTimer -= timeDeltaMin;
                        const conflictHalt = train.status === 'in-siding';
                        if (conflictHalt) train.conflictTime += timeDeltaMin;
                        train.totalDelay += timeDeltaMin;

                        if (train.haltTimer <= 0) {
                            const point = Object.values(simCase.layout.points).find(p => p.isDecisionPoint && Math.abs(train.position - p.mile) < 0.1);
                            if(point && (!approvalRequest || approvalRequest.trainId !== train.id)) {
                                train.status = 'awaiting_approval';
                                train.speed = 0;
                                setApprovalRequest({ trainId: train.id, decisionPointId: point.label || 'junction', possiblePaths: [train.path] });
                                continue;
                            }
                            train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                            train.status = 'on-time';
                            train.haltTimer = 0;
                        } else {
                            train.speed = 0;
                            continue; 
                        }
                    }
                    
                    const currentPoint = Object.values(simCase.layout.points).find(p => p.isDecisionPoint && Math.abs(train.position - p.mile) < 0.1);
                    if (currentPoint && train.haltTimer <= 0 && (!approvalRequest || approvalRequest.trainId !== train.id)) {
                       train.haltTimer = APPROVAL_HALT_S / 60;
                       train.speed = 0;
                       train.status = 'stopped';
                       continue;
                    }


                    // --- Path switching logic ---
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
                            } else {
                            console.warn(`Train ${train.id} has invalid next track ID ${nextTrackId} in path. Halting.`);
                            train.status = 'stopped';
                            continue;
                            }
                    }
                    
                    const currentPlatform = Object.values(simCase.layout.points).find(p => p.isPlatform && Math.abs(train.position - p.mile) < 0.2);
                    if (currentPlatform && !train.hasHaltedAtPlatform) {
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
                    if(!['at-platform', 'in-siding', 'breakdown', 'awaiting_approval', 'stopped'].includes(train.status)) {
                        train.status = newStatus;
                    }
                    
                    const distanceMoved = train.speed * (timeDeltaMin / 60);
                    train.position += distanceMoved;

                    const exitPoints = Object.values(simCase.layout.points).filter(p => p.label?.startsWith('E_') || p.label?.startsWith('SL_') || p.label?.startsWith('S1') || p.label?.startsWith('S2'));
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
    }, [caseIdToUse, simCase, approvalRequest, setApprovalRequest, setMetrics, setSimulationTime, setTrains]);

    useEffect(() => {
        if (!isRunning) return;
        const intervalDelay = 100 / simulationSpeedRef.current;
        const interval = setInterval(advanceSimulation, intervalDelay);
        return () => clearInterval(interval);
    }, [isRunning, advanceSimulation]);

    const handleRequestDecision = (trainId: string, approved: boolean, newPath?: string[]) => {
        setTrains(prevTrains => {
            const newTrains = [...prevTrains];
            const trainIndex = newTrains.findIndex(t => t.id === trainId);
            if (trainIndex !== -1) {
                const train = newTrains[trainIndex];
                train.approvalState = approved ? 'approved' : 'rejected';

                if (train.decisionPointId === 'start_approval') {
                     if (approved) {
                        const initialTrackLayout = simCase.layout.tracks[train.track];
                        if (initialTrackLayout) {
                            const entryPoint = simCase.layout.points[initialTrackLayout.points[0]];
                            train.position = entryPoint.mile;
                        }
                        train.status = 'on-time';
                        train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                    } else {
                        train.status = 'stopped';
                    }
                } else { // For subsequent trigger points
                    if (approved) {
                        train.status = 'on-time';
                        train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                        if(newPath) {
                            const currentPathIndex = train.currentPathIndex;
                            const oldPath = train.path;
                            const finalPath = [...oldPath.slice(0, currentPathIndex), ...newPath];
                            train.path = finalPath;
                        }
                    } else {
                        train.status = 'stopped';
                        train.speed = 0;
                    }
                }
                 train.decisionPointId = undefined;
            }
            return newTrains;
        });
        setApprovalRequest(null);
    };


    const reset = useCallback(() => {
        setIsRunning(false);
        useSimulationStore.setState({ caseId: caseIdToUse });
        setTrains(initializeTrains());
        setSimulationTime(0);
        setMetrics(initialMetrics);
        setApprovalRequest(null);
        priorityConflictsResolved.current = 0;
        totalPriorityDecisions.current = 0;
        setTimeout(() => setIsRunning(true), 100);
    }, [initializeTrains, caseIdToUse, setTrains, setSimulationTime, setMetrics, setApprovalRequest, setIsRunning]);

    const step = useCallback(() => {
        if (!isRunning) {
            advanceSimulation();
        }
    }, [isRunning, advanceSimulation]);

    return { 
        ...store,
        caseId: caseIdToUse,
        reset, 
        step, 
        handleRequestDecision,
    };
};

useSimulation.getState = useSimulationStore.getState;
