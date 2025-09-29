import type { Train } from '@/hooks/use-simulation';

type Point = { x: number; y: number; label?: string };
type TrackLayout = {
    points: string[];
}
type Layout = {
    points: Record<string, Point>;
    tracks: Record<string, TrackLayout>;
    config: {
        trackColor: string;
        stationColor: string;
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

const commonLayout: Layout = {
    points: {
        'W0': { x: 50, y: 100 }, 'E0': { x: 1150, y: 100 },
        'W1': { x: 50, y: 150 }, 'E1': { x: 1150, y: 150 },
        'W2': { x: 50, y: 200 }, 'E2': { x: 1150, y: 200 },
        'W3': { x: 50, y: 250 }, 'E3': { xும்: 1150, y: 250 },
        'P1': { x: 600, y: 100, label: 'P1' },
        'P2': { x: 600, y: 150, label: 'P2' },
        'P3': { x: 600, y: 200, label: 'P3' },
        'P4': { x: 600, y: 250, label: 'P4' },
        'S_EB': { x: 700, y: 175, label: 'S' }, // EB Siding
        'S_WB': { x: 700, y: 225, label: 'S' }, // WB Siding
    },
    tracks: {
        'T1': { points: ['W0', 'E0'] }, // EB
        'T2': { points: ['W1', 'E1'] }, // EB
        'T3': { points: ['E2', 'W2'] }, // WB
        'T4': { points: ['E3', 'W3'] }, // WB
        'S1': { points: ['P2', 'S_EB', 'E1']}, // EB Siding
        'S2': { points: ['E2', 'S_WB', 'W3']}, // WB Siding
    },
    config: {
        trackColor: '#4b5563',
        stationColor: '#e5e7eb',
    }
};

const normalOpsTrains: Partial<Train>[] = [
    { id: 'P1', type: 'passenger', track: 'T1', baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high', cargo: null },
    { id: 'F1', type: 'freight', track: 'T2', baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low', cargo: 'electronics' },
    { id: 'P2', type: 'passenger', track: 'T3', baseSpeed: 100, platformHaltDuration: 2, startTime: 2, priority: 'high', cargo: null },
    { id: 'F2', type: 'freight', track: 'T4', baseSpeed: 50, platformHaltDuration: 5, startTime: 7, priority: 'low', cargo: 'steel' },
]


export const simulationCases: Record<string, SimulationCase> = {
    'case1': {
        id: 'case1',
        name: 'Normal Operations',
        description: 'A standard operational day with a mix of passenger and freight trains.',
        sectionId: SECTION_ID,
        metrics: { throughput: 4, avgDelay: 2.1 },
        layout: commonLayout,
        initialTrains: normalOpsTrains,
        config: {}
    },
    'case4': {
        id: 'case4',
        name: 'Increased Traffic',
        description: 'Higher throughput test with 6 trains, testing headway and siding constraints.',
        sectionId: SECTION_ID,
        metrics: { throughput: 6, avgDelay: 5.5 },
        layout: commonLayout,
        initialTrains: [
            ...normalOpsTrains,
            { id: 'P3', type: 'passenger', track: 'T1', baseSpeed: 100, platformHaltDuration: 2, startTime: 10, priority: 'high' },
            { id: 'F3', type: 'freight', track: 'T4', baseSpeed: 50, platformHaltDuration: 5, startTime: 12, priority: 'low', cargo: 'automobiles' }
        ],
        config: {}
    },
    'case5': {
        id: 'case5',
        name: 'Track Closure',
        description: 'Track 2 is closed for maintenance, forcing eastbound trains to share Track 1.',
        sectionId: SECTION_ID,
        metrics: { throughput: 3, avgDelay: 15.8 },
        layout: {
            ...commonLayout,
            tracks: {
                ...commonLayout.tracks,
                'T2': { points: ['W1', 'E1'] }, // Visually present but inactive
            }
        },
        initialTrains: [
            { id: 'P1', type: 'passenger', track: 'T1', baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high' },
            { id: 'F1', type: 'freight', track: 'T1', baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low' }, // Rerouted to T1
            { id: 'P2', type: 'passenger', track: 'T3', baseSpeed: 100, platformHaltDuration: 2, startTime: 2, priority: 'high' },
            { id: 'F2', type: 'freight', track: 'T4', baseSpeed: 50, platformHaltDuration: 5, startTime: 7, priority: 'low' },
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
        layout: commonLayout,
        initialTrains: [
             { id: 'P1', type: 'passenger', track: 'T1', baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high' },
             { id: 'F1', type: 'freight', track: 'T2', baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low', cargo: 'perishables' },
             { id: 'P2', type: 'passenger', track: 'T3', baseSpeed: 100, platformHaltDuration: 2, startTime: 2, priority: 'high' }, // Start time already reflects delay
             { id: 'F2', type: 'freight', track: 'T4', baseSpeed: 50, platformHaltDuration: 5, startTime: 7, priority: 'low' },
        ],
        config: {
            weatherFactor: 0.9 // 10% speed reduction
        }
    }
}
