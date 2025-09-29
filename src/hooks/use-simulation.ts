import { useState, useEffect, useCallback, useRef } from 'react';
import { simulationCases } from '@/lib/simulation-cases';

export type Train = {
    id: string;
    type: 'express' | 'passenger' | 'freight' | 'emergency';
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

    // Dynamic state
    haltTimer: number; // minutes remaining for halt
    hasHaltedAtPlatform: boolean;
};

// Simulation constants
const TIME_STEP_S = 10; // Each tick is 10 seconds of simulation time
const SECTION_LENGTH_MI = 20;
const STATION_MILE = 10;
const SIDING_MILE = 12;
const SIDING_HALT_DURATION_MIN = 5;
const HEADWAY_MIN = 5;


export const useSimulation = (caseId: string) => {
    const simCase = simulationCases[caseId];
    if (!simCase) throw new Error(`Simulation case ${caseId} not found.`);
    
    const initializeTrains = useCallback(() => {
        return JSON.parse(JSON.stringify(simCase.initialTrains.map(t => ({...t, position: -1, speed: 0, status: 'on-time', haltTimer: 0, hasHaltedAtPlatform: false}))));
    }, [simCase.initialTrains]);

    const [trains, setTrains] = useState<Train[]>(initializeTrains);
    const [isRunning, setIsRunning] = useState(true);
    const [simulationSpeed, setSimulationSpeed] = useState(1);
    const [simulationTime, setSimulationTime] = useState(0); // in minutes
    
    const simulationSpeedRef = useRef(simulationSpeed);
    simulationSpeedRef.current = simulationSpeed;

    useEffect(() => {
        // Reset state when caseId changes
        setTrains(initializeTrains());
        setSimulationTime(0);
        setIsRunning(true);
    }, [caseId, initializeTrains]);


    const advanceSimulation = useCallback(() => {
        setSimulationTime(prevTime => prevTime + (TIME_STEP_S / 60) * simulationSpeedRef.current);
        
        setTrains(currentTrains => {
            const newTrains = [...currentTrains];

            for (let i = 0; i < newTrains.length; i++) {
                const train = newTrains[i];

                if (train.status === 'finished') continue;
                
                // --- Train Activation ---
                if (train.position < 0 && simulationTime >= train.startTime) {
                    train.position = 0;
                    train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                    train.status = 'on-time';
                }
                if (train.position < 0) continue;

                // --- Halt Logic ---
                if (train.haltTimer > 0) {
                    train.haltTimer -= (TIME_STEP_S / 60) * simulationSpeedRef.current;
                    if (train.haltTimer <= 0) {
                        train.speed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                        train.status = 'on-time';
                    } else {
                        train.speed = 0;
                        continue; // Skip movement if halted
                    }
                }
                
                // --- Platform Halt ---
                if (!train.hasHaltedAtPlatform && Math.abs(train.position - STATION_MILE) < 0.1) {
                    train.status = 'at-platform';
                    train.haltTimer = train.platformHaltDuration;
                    train.hasHaltedAtPlatform = true;
                    train.speed = 0;
                    continue;
                }

                // --- Headway and Conflict Logic ---
                let newSpeed = train.baseSpeed * (simCase.config.weatherFactor || 1);
                let newStatus: Train['status'] = train.status === 'at-platform' || train.status === 'in-siding' ? train.status : 'on-time';
                let leadTrainDistance = Infinity;

                for (let j = 0; j < newTrains.length; j++) {
                    if (i === j || newTrains[j].status === 'finished') continue;
                    const otherTrain = newTrains[j];
                    if (otherTrain.track === train.track && otherTrain.position > train.position) {
                        leadTrainDistance = Math.min(leadTrainDistance, otherTrain.position - train.position);
                    }
                }
                
                const headwayDistance = (train.baseSpeed / 60) * HEADWAY_MIN; // distance covered in 5 mins
                const stoppingDistance = headwayDistance * 0.5;
                const slowingDistance = headwayDistance;

                if (leadTrainDistance < stoppingDistance) {
                    newSpeed = 0;
                    newStatus = 'stopped';
                } else if (leadTrainDistance < slowingDistance) {
                    newSpeed = train.baseSpeed * (leadTrainDistance / slowingDistance);
                    newStatus = 'slowing';
                }

                // --- Siding Logic for Low Priority Trains ---
                const nextPassengerTrain = newTrains.find(t => 
                    t.priority === 'high' && 
                    t.track === train.track && 
                    t.position < train.position
                );

                if (train.priority === 'low' && nextPassengerTrain) {
                    const timeToConflict = ((train.position - nextPassengerTrain.position) / (nextPassengerTrain.speed - train.speed)) * 60;
                     if (timeToConflict > 0 && timeToConflict < HEADWAY_MIN && Math.abs(train.position - SIDING_MILE) < 1) {
                        train.status = 'in-siding';
                        train.haltTimer = SIDING_HALT_DURATION_MIN;
                        newSpeed = 0;
                        train.position = SIDING_MILE; // snap to siding
                    }
                }

                train.speed = newSpeed;
                train.status = newStatus;
                
                // --- Position Update ---
                const distanceMoved = train.speed * (TIME_STEP_S / 3600); // speed is in mph
                train.position += distanceMoved * simulationSpeedRef.current;

                if (train.position >= SECTION_LENGTH_MI) {
                    train.status = 'finished';
                    train.speed = 0;
                }

                newTrains[i] = train;
            }

            return newTrains;
        });
    }, [caseId, simCase.config.weatherFactor, simulationTime]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(advanceSimulation, 100);

        return () => clearInterval(interval);
    }, [isRunning, advanceSimulation]);

    const reset = useCallback(() => {
        setIsRunning(false);
        setTrains(initializeTrains());
        setSimulationTime(0);
    }, [initializeTrains]);

    const step = useCallback(() => {
        if (!isRunning) {
            advanceSimulation();
        }
    }, [isRunning, advanceSimulation]);

    return { trains, isRunning, setIsRunning, reset, step, simulationSpeed, setSimulationSpeed, simulationTime };
};
