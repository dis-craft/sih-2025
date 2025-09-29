import type { Train } from '@/hooks/use-simulation';

type Point = { x: number; y: number; label?: string; isPlatform?: boolean, mile: number };
type TrackLayout = {
    points: [string, string];
    controlPoints?: [string, string] | [string];
}
type Layout = {
    points: Record<string, Point>;
    tracks: Record<string, TrackLayout>;
    config: {
        trackColor: string;
        stationColor: string;
        platformColor: string;
    }
};

export type SimulationCase = {
    id: string;
    name: string;
    description: string;
    sectionId: string;
    layout: Layout;
    initialTrains: Partial<Train>[];
    metrics: { throughput: number; avgDelay: number; };
    config: {
        weatherFactor?: number;
        trackClosure?: string;
    }
}

const SECTION_ID = "SBC-MYS";

const case1Layout: Layout = {
    points: {
        'W0': { x: 50, y: 100, mile: 0 }, 'E0': { x: 1150, y: 100, mile: 20 },
        'W1': { x: 50, y: 150, mile: 0 }, 'E1': { x: 1150, y: 150, mile: 20 },
        'W2': { x: 50, y: 200, mile: 0 }, 'E2': { x: 1150, y: 200, mile: 20 },
        'W3': { x: 50, y: 250, mile: 0 }, 'E3': { x: 1150, y: 250, mile: 20 },
        'P1': { x: 600, y: 100, label: 'P1', isPlatform: true, mile: 10 },
        'P2': { x: 600, y: 150, label: 'P2', isPlatform: true, mile: 10 },
        'P3': { x: 600, y: 200, label: 'P3', isPlatform: true, mile: 10 },
        'P4': { x: 600, y: 250, label: 'P4', isPlatform: true, mile: 10 },
        'S_EB': { x: 750, y: 175, label: 'S', mile: 12 },
    },
    tracks: {
        'T1': { points: ['W0', 'E0'] },
        'T2': { points: ['W1', 'E1'] },
        'T3': { points: ['E2', 'W2'] },
        'T4': { points: ['E3', 'W3'] },
    },
    config: {
        trackColor: '#4b5563',
        stationColor: '#e5e7eb',
        platformColor: '#3b82f6',
    }
};

const case7Layout: Layout = {
    points: {
        // Entry/Exit
        'W_EB1': { x: 50, y: 150, mile: 0 },
        'W_EB2': { x: 50, y: 200, mile: 0 },
        'E_EB': { x: 1150, y: 175, mile: 20 },
        
        // Platforms
        'P1': { x: 600, y: 100, label: 'P1', isPlatform: true, mile: 10 },
        'P2': { x: 600, y: 250, label: 'P2', isPlatform: true, mile: 10 },
        
        // Junction Control Points
        'J1_W': { x: 300, y: 175, mile: 5 }, 'J1_E': { x: 450, y: 175, mile: 8 },
        'J2_W': { x: 750, y: 175, mile: 12 }, 'J2_E': { x: 900, y: 175, mile: 15 },

        // Crossover controls
        'C1': { x: 400, y: 125, mile: 7},
        'C2': { x: 400, y: 225, mile: 7},
        'C3': { x: 800, y: 125, mile: 13},
        'C4': { x: 800, y: 225, mile: 13},
    },
    tracks: {
        // Main Lines
        'EB1_IN': { points: ['W_EB1', 'J1_W'] },
        'EB2_IN': { points: ['W_EB2', 'J1_W'] },
        'CENTER_THRU': { points: ['J1_E', 'J2_W']},
        'EB_OUT': { points: ['J2_E', 'E_EB'] },

        // Platform Tracks (Crossovers)
        'J1-P1': { points: ['J1_W', 'P1'], controlPoints: ['C1'] },
        'P1-J2': { points: ['P1', 'J2_E'], controlPoints: ['C3'] },
        
        'J1-P2': { points: ['J1_W', 'P2'], controlPoints: ['C2'] },
        'P2-J2': { points: ['P2', 'J2_E'], controlPoints: ['C4'] },

        // Direct connection for through traffic
        'J1-J2': { points: ['J1_W', 'J2_E']}
    },
    config: {
        trackColor: '#52525b',
        stationColor: '#e5e7eb',
        platformColor: '#2563eb',
    }
}


const normalOpsTrains: Partial<Train>[] = [
    { id: 'T12613', path: ['T1'], baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high', cargo: null },
    { id: 'F5678', path: ['T2'], baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low', cargo: 'electronics' },
    { id: 'T16216', path: ['T3'], baseSpeed: 100, platformHaltDuration: 2, startTime: 2, priority: 'high', cargo: null },
    { id: 'T20660', path: ['T4'], baseSpeed: 50, platformHaltDuration: 5, startTime: 7, priority: 'low', cargo: 'steel' },
];

export const simulationCases: Record<string, SimulationCase> = {
    'case1': {
        id: 'case1',
        name: 'Normal Operations',
        description: 'A standard operational day with a mix of passenger and freight trains.',
        sectionId: SECTION_ID,
        metrics: { throughput: 4, avgDelay: 2.1 },
        layout: case1Layout,
        initialTrains: normalOpsTrains,
        config: {}
    },
    'case4': {
        id: 'case4',
        name: 'Increased Traffic',
        description: 'Higher throughput test with 6 trains, testing headway and siding constraints.',
        sectionId: SECTION_ID,
        metrics: { throughput: 6, avgDelay: 5.5 },
        layout: case1Layout,
        initialTrains: [
            ...normalOpsTrains,
            { id: 'EM01', path: ['T1'], baseSpeed: 100, platformHaltDuration: 2, startTime: 10, priority: 'high' },
            { id: 'T12345', path: ['T4'], baseSpeed: 50, platformHaltDuration: 5, startTime: 12, priority: 'low', cargo: 'automobiles' }
        ],
        config: {}
    },
    'case5': {
        id: 'case5',
        name: 'Track Closure',
        description: 'Track 2 is closed, forcing eastbound trains to share Track 1.',
        sectionId: SECTION_ID,
        metrics: { throughput: 3, avgDelay: 15.8 },
        layout: case1Layout,
        initialTrains: [
            { id: 'T12613', path: ['T1'], baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high' },
            { id: 'F5678', path: ['T1'], baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low' }, // Rerouted
            { id: 'T16216', path: ['T3'], baseSpeed: 100, platformHaltDuration: 2, startTime: 2, priority: 'high' },
            { id: 'T20660', path: ['T4'], baseSpeed: 50, platformHaltDuration: 5, startTime: 7, priority: 'low' },
        ],
        config: {
            trackClosure: 'T2'
        }
    },
    'case6': {
        id: 'case6',
        name: 'Multiple Delays',
        description: 'Weather slowdown and a delayed passenger train strain the system.',
        sectionId: SECTION_ID,
        metrics: { throughput: 4, avgDelay: 8.3 },
        layout: case1Layout,
        initialTrains: [
             { id: 'T12613', path: ['T1'], baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high' },
             { id: 'F5678', path: ['T2'], baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low', cargo: 'perishables' },
             { id: 'T16216', path: ['T3'], baseSpeed: 100, platformHaltDuration: 2, startTime: 7, priority: 'high' }, // Delayed
             { id: 'T20660', path: ['T4'], baseSpeed: 50, platformHaltDuration: 5, startTime: 7, priority: 'low' },
        ],
        config: {
            weatherFactor: 0.9
        }
    },
    'case7': {
        id: 'case7',
        name: 'Optimized Routing (MILP)',
        description: 'Heavy traffic scenario where an optimization model dynamically routes trains to avoid conflicts.',
        sectionId: SECTION_ID,
        metrics: { throughput: 4, avgDelay: 1.5 },
        layout: case7Layout,
        initialTrains: [
            { id: 'T12613', baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high', path: ['EB1_IN', 'J1-P1', 'P1-J2', 'EB_OUT']},
            { id: 'T16216', baseSpeed: 100, platformHaltDuration: 2, startTime: 1, priority: 'high', path: ['EB2_IN', 'J1-P2', 'P2-J2', 'EB_OUT']}, // Optimized to P2
            { id: 'F5678', baseSpeed: 60, platformHaltDuration: 0, startTime: 2, priority: 'low', path: ['EB1_IN', 'J1-J2', 'EB_OUT']}, // Express freight, no halt
            { id: 'T20660', baseSpeed: 100, platformHaltDuration: 2, startTime: 8, priority: 'high', path: ['EB2_IN', 'J1-P1', 'P1-J2', 'EB_OUT']},
        ],
        config: {}
    }
}
