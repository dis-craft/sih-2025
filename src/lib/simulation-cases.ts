import type { Train } from '@/hooks/use-simulation';
import type { Simulation } from './schema';

type Point = { x: number; y: number; label?: string };
type Layout = {
    points: Record<string, Point>;
    paths: Record<string, string[]>;
};

export type SimulationCase = {
    id: string;
    name: string;
    description: string;
    layout: Layout;
    initialTrains: Train[];
    metrics: Simulation['metrics'];
}

export const simulationCases: Record<string, SimulationCase> = {
    'case1': {
        id: 'case1',
        name: 'KSR Station - Normal Operations',
        description: 'A standard operational day at KSR Station with a mix of passenger, express, and freight trains.',
        metrics: { throughput: 8, avgDelay: 4.2 },
        layout: {
            points: {
                // Approach
                'entry-ext': { x: 50, y: 300 },
                'entry1': { x: 200, y: 150 },
                'entry2': { x: 200, y: 450 },
                // Station Platforms Start
                'p1-start': { x: 350, y: 150, label: 'P1' },
                'p2-start': { x: 350, y: 250, label: 'P2' },
                'p3-start': { x: 350, y: 350, label: 'P3' },
                'p4-start': { x: 350, y: 450, label: 'P4' },
                // Station Platforms End
                'p1-end': { x: 850, y: 150 },
                'p2-end': { x: 850, y: 250 },
                'p3-end': { x: 850, y: 350 },
                'p4-end': { x: 850, y: 450 },
                // Exits
                'exit1': { x: 1000, y: 200 },
                'exit2': { x: 1000, y: 400 },
                'exit-ext': { x: 1150, y: 300 },
            },
            paths: {
                'approach-ext': ['entry-ext', 'entry1'],
                'approach1': ['entry1', 'p1-start'],
                'approach2': ['entry2', 'p4-start'],
                'crossover1': ['entry1', 'p2-start'],
                'crossover2': ['entry2', 'p3-start'],
                'platform1': ['p1-start', 'p1-end'],
                'platform2': ['p2-start', 'p2-end'],
                'platform3': ['p3-start', 'p3-end'],
                'platform4': ['p4-start', 'p4-end'],
                'crossover3': ['p1-end', 'exit1'],
                'crossover4': ['p2-end', 'exit1'],
                'crossover5': ['p3-end', 'exit2'],
                'crossover6': ['p4-end', 'exit2'],
                'exit1-path': ['exit1', 'exit-ext'],
                'exit2-path': ['exit2', 'exit-ext'],
            }
        },
        initialTrains: [
            { id: 'T12613', type: 'express', path: 'approach1', progress: 0.1, speed: 0.015, maxSpeed: 0.015, status: 'on-time' },
            { id: 'T16216', type: 'passenger', path: 'approach2', progress: 0.3, speed: 0.01, maxSpeed: 0.01, status: 'on-time' },
            { id: 'T20660', type: 'express', path: 'platform3', progress: 0.5, speed: 0.015, maxSpeed: 0.015, status: 'on-time' },
            { id: 'F5678', type: 'freight', path: 'platform4', progress: 0.8, speed: 0.007, maxSpeed: 0.007, status: 'on-time' },
            { id: 'EM01', type: 'emergency', path: 'approach-ext', progress: 0.2, speed: 0.02, maxSpeed: 0.02, status: 'on-time' },
        ],
    }
}
