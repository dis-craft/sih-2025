

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

const complexJunctionLayout: Layout = {
    points: {
      // Entry/Exit points
      'S1': { x: 1150, y: 320, label: 'S1', mile: 20 },
      'S2': { x: 1150, y: 370, label: 'S2', mile: 20 },
      'S3': { x: 50, y: 400, label: 'S3', mile: 0 },
      'S4': { x: 50, y: 200, label: 'S4', mile: 0 },
      'S5': { x: 50, y: 150, label: 'S5', mile: 0 },
      
      // Platforms
      'P1': { x: 600, y: 100, label: 'Platform 1', isPlatform: true, mile: 10 },
      'P2': { x: 600, y: 250, label: 'Platform 2', isPlatform: true, mile: 10 },
      'P3': { x: 600, y: 350, label: 'Platform 3', isPlatform: true, mile: 10 },

      // Track connection points (junctions, switches)
      'J_S5_P1_A': { x: 250, y: 150, mile: 4 }, 'J_S5_P1_B': { x: 450, y: 100, mile: 8 },
      'J_S4_P2_A': { x: 250, y: 200, mile: 4 }, 'J_S4_P2_B': { x: 450, y: 250, mile: 8 },
      'J_S3_P3_A': { x: 250, y: 400, mile: 4 }, 'J_S3_P3_B': { x: 450, y: 350, mile: 8 },
      'J_S4_P3_A': { x: 300, y: 300, mile: 5 },

      'J_P1_S1_A': { x: 750, y: 100, mile: 12 }, 'J_P1_S1_B': { x: 950, y: 320, mile: 16 },
      'J_P2_S1_A': { x: 750, y: 250, mile: 12 }, 'J_P2_S1_B': { x: 900, y: 280, mile: 15 },
      'J_P2_S2_A': { x: 750, y: 250, mile: 12 }, 'J_P2_S2_B': { x: 950, y: 370, mile: 16 },
      'J_P3_S2_A': { x: 750, y: 350, mile: 12 }, 'J_P3_S2_B': { x: 900, y: 390, mile: 15 },
      
      // Siding points for tracks 9 & 11
      'SD9_A': { x: 300, y: 80, mile: 5 }, 'SD9_B': { x: 400, y: 80, mile: 7 },
      'SD11_A': { x: 300, y: 50, mile: 5 }, 'SD11_B': { x: 400, y: 50, mile: 7 },
    },
    tracks: {
      // S5 -> P1 / Siding
      'S5-J1': { points: ['S5', 'J_S5_P1_A']},
      'J1-SD11': { points: ['J_S5_P1_A', 'SD11_A']},
      'SD11': { points: ['SD11_A', 'SD11_B']},
      'SD11-J2': { points: ['SD11_B', 'J_S5_P1_B']},
      'J1-SD9': { points: ['J_S5_P1_A', 'SD9_A']},
      'SD9': { points: ['SD9_A', 'SD9_B']},
      'SD9-J2': { points: ['SD9_B', 'J_S5_P1_B']},
      'J1-J2_direct': { points: ['J_S5_P1_A', 'J_S5_P1_B'] }, // Track 7
      'J2-P1': { points: ['J_S5_P1_B', 'P1']},
      
      // S4 -> P2 / P3
      'S4-J3': { points: ['S4', 'J_S4_P2_A']},
      'J3-P2': { points: ['J_S4_P2_A', 'P2']}, // Track 5
      'J3-J4': { points: ['J_S4_P2_A', 'J_S4_P3_A']},
      'J4-P3': { points: ['J_S4_P3_A', 'P3']},
      
      // S3 -> P3
      'S3-J5': { points: ['S3', 'J_S3_P3_A']},
      'J5-P3': { points: ['J_S3_P3_A', 'P3']},

      // P1 -> S1
      'P1-J6': { points: ['P1', 'J_P1_S1_A']},
      'J6-S1': { points: ['J_P1_S1_A', 'S1'], controlPoints: ['J_P1_S1_B'] },
      
      // P2 -> S1 / S2
      'P2-J7': { points: ['P2', 'J_P2_S1_A']},
      'J7-S1': { points: ['J_P2_S1_A', 'S1'], controlPoints: ['J_P2_S1_B']}, // Track 1
      'P2-J8': { points: ['P2', 'J_P2_S2_A']},
      'J8-S2': { points: ['J_P2_S2_A', 'S2'], controlPoints: ['J_P2_S2_B']}, // Track 2
      
      // P3 -> S2
      'P3-J9': { points: ['P3', 'J_P3_S2_A']},
      'J9-S2': { points: ['J_P3_S2_A', 'S2'], controlPoints: ['J_P3_S2_B']}, // Track 4
    },
    config: {
        trackColor: '#52525b',
        stationColor: '#e5e7eb',
        platformColor: '#2563eb',
    }
};

const awajiStationLayout: Layout = {
    points: {
        // West Entry/Exit (Kyoto Main Line)
        'KML_W_IN':  { x: 50, y: 250, mile: 0 },
        'KML_W_OUT': { x: 50, y: 300, mile: 0 },

        // East Entry/Exit (Kyoto Main Line)
        'KML_E_IN':  { x: 1150, y: 400, mile: 20 },
        'KML_E_OUT': { x: 1150, y: 450, mile: 20 },

        // South Entry/Exit (Senri Line)
        'SL_S_IN':  { x: 250, y: 550, mile: 0 },
        'SL_S_OUT': { x: 300, y: 550, mile: 0 },

        // North Entry/Exit (Senri Line)
        'SL_N_IN':  { x: 950, y: 50, mile: 20 },
        'SL_N_OUT': { x: 1000, y: 50, mile: 20 },

        // Platforms
        'P2': { x: 600, y: 175, label: 'P2', isPlatform: true, mile: 10 },
        'P3': { x: 600, y: 225, label: 'P3', isPlatform: true, mile: 10 },
        'P4': { x: 600, y: 375, label: 'P4', isPlatform: true, mile: 10 },
        'P5': { x: 600, y: 425, label: 'P5', isPlatform: true, mile: 10 },
        
        // Junctions & Crossovers
        'J_W1': { x: 350, y: 275, mile: 4 }, // West main junction
        'J_P23_W': { x: 450, y: 200, mile: 8 }, 'J_P23_E': { x: 750, y: 200, mile: 12 },
        'J_P45_W': { x: 450, y: 400, mile: 8 }, 'J_P45_E': { x: 750, y: 400, mile: 12 },

        // Senri Line merge/diverge points
        'J_SL_S': { x: 400, y: 475, mile: 5 },
        'J_SL_N': { x: 850, y: 125, mile: 15 },
        
        // Crossover points
        'C_W_1': { x: 400, y: 225, mile: 6 }, 'C_W_2': { x: 400, y: 375, mile: 6},
        'C_E_1': { x: 800, y: 225, mile: 14 }, 'C_E_2': { x: 800, y: 375, mile: 14 },
    },
    tracks: {
        // Kyoto Main Line (KML) Westbound (right-to-left) -> P3/P4
        'KML_E_IN-J_P45_E': { points: ['KML_E_IN', 'J_P45_E'] },
        'J_P45_E-P4': { points: ['J_P45_E', 'P4'] },
        'P4-J_P45_W': { points: ['P4', 'J_P45_W'] },
        'J_P45_W-J_W1': { points: ['J_P45_W', 'J_W1'], controlPoints: ['C_W_2'] },
        'J_W1-KML_W_OUT': { points: ['J_W1', 'KML_W_OUT'] },
        
        'J_P45_E-P3_X': { points: ['J_P45_E', 'J_P23_E'], controlPoints: ['C_E_2', 'C_E_1']},
        'J_P23_E-P3': { points: ['J_P23_E', 'P3']},
        'P3-J_P23_W': { points: ['P3', 'J_P23_W']},
        'J_P23_W-J_W1': { points: ['J_P23_W', 'J_W1'], controlPoints: ['C_W_1']},

        // Kyoto Main Line (KML) Eastbound (left-to-right) -> P2/P5
        'KML_W_IN-J_W1': { points: ['KML_W_IN', 'J_W1'] },
        'J_W1-J_P23_W': { points: ['J_W1', 'J_P23_W'], controlPoints: ['C_W_1']},
        'J_P23_W-P2': { points: ['J_P23_W', 'P2']},
        'P2-J_P23_E': { points: ['P2', 'J_P23_E']},
        'J_P23_E-J_SL_N': { points: ['J_P23_E', 'J_SL_N'], controlPoints: ['C_E_1']},
        'J_SL_N-SL_N_OUT': { points: ['J_SL_N', 'SL_N_OUT']},
        
        'J_W1-J_P45_W': { points: ['J_W1', 'J_P45_W'], controlPoints: ['C_W_2']},
        'J_P45_W-P5': { points: ['J_P45_W', 'P5']},
        'P5-J_P45_E': { points: ['P5', 'J_P45_E']},
        'J_P45_E-KML_E_OUT': { points: ['J_P45_E', 'KML_E_OUT']},

        // Senri Line (SL) Southbound (North to South, right-to-left)
        'SL_N_IN-J_SL_N': { points: ['SL_N_IN', 'J_SL_N']},
        'J_SL_N-P2': { points: ['J_SL_N', 'P2']}, // Assuming SL trains can use P2
        // Path continues from P2 to south...
        'P2-J_W1_X': { points: ['P2', 'J_W1'], controlPoints: ['J_P23_W', 'C_W_1']},
        'J_W1-J_SL_S': { points: ['J_W1', 'J_SL_S'], controlPoints: [{x: 375, y: 350, mile: 5}]},
        'J_SL_S-SL_S_OUT': { points: ['J_SL_S', 'SL_S_OUT']},

        // Senri Line (SL) Northbound (South to North, left-to-right)
        'SL_S_IN-J_SL_S_NB': { points: ['SL_S_IN', 'J_SL_S']},
        'J_SL_S-P5': { points: ['J_SL_S', 'P5'], controlPoints: ['J_P45_W']}, // Assuming SL trains can use P5
        // Path continues from P5 to north...
        'P5-J_SL_N_X': { points: ['P5', 'J_SL_N'], controlPoints: ['J_P45_E', 'C_E_2', 'C_E_1']},
        'J_SL_N-SL_N_OUT_2': { points: ['J_SL_N', 'SL_N_OUT']},
    },
    config: {
        trackColor: '#22c55e', // A more vibrant green
        stationColor: '#e5e7eb',
        platformColor: '#808080',
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
            { id: 'T12613', path: ['T1'], baseSpeed: 100, platformHaltDuration: 2, startTime: 0, priority: 'high' },
            { id: 'F5678', path: ['T2'], baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low' },
            { id: 'T16216', path: ['T3'], baseSpeed: 100, platformHaltDuration: 2, startTime: 2, priority: 'high' },
            { id: 'T20660', path: ['T4'], baseSpeed: 50, platformHaltDuration: 5, startTime: 7, priority: 'low' },
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
            { id: 'F5678', path: ['T1'], baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low', sidingHaltDuration: 10 }, // Rerouted
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
             { id: 'F5678', path: ['T2'], baseSpeed: 50, platformHaltDuration: 5, startTime: 5, priority: 'low', cargo: 'perishables', sidingHaltDuration: 5 },
             { id: 'T16216', path: ['T3'], baseSpeed: 100, platformHaltDuration: 2, startTime: 2, priority: 'high', delay: 5 }, // Delayed start
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
    },
    'case8': {
        id: 'case8',
        name: 'Complex Junction',
        description: 'Simulates a complex station area based on a real-world track schematic, with multiple intersecting routes.',
        sectionId: SECTION_ID,
        metrics: { throughput: 4, avgDelay: 3.0 },
        layout: complexJunctionLayout,
        initialTrains: [
            { id: 'T12613', baseSpeed: 70, platformHaltDuration: 2, startTime: 0, priority: 'high', path: ['S5-J1', 'J1-J2_direct', 'J2-P1', 'P1-J6', 'J6-S1']}, // S5 -> P1 -> S1
            { id: 'T16216', baseSpeed: 70, platformHaltDuration: 2, startTime: 2, priority: 'high', path: ['S4-J3', 'J3-P2', 'P2-J8', 'J8-S2']}, // S4 -> P2 -> S2
            { id: 'F5678', baseSpeed: 40, platformHaltDuration: 5, startTime: 4, priority: 'low', path: ['S3-J5', 'J5-P3', 'P3-J9', 'J9-S2']},    // S3 -> P3 -> S2
            { id: 'T20660', baseSpeed: 70, platformHaltDuration: 2, startTime: 6, priority: 'high', path: ['S4-J3', 'J3-J4', 'J4-P3', 'P3-J9', 'J9-S2']}, // S4 -> P3 -> S2 (conflict with F5678)
        ],
        config: {}
    },
    'case9': {
        id: 'case9',
        name: 'Awaji Station Model',
        description: 'A realistic simulation of the complex Awaji Station junction in Japan, featuring multiple merging and diverging lines.',
        sectionId: SECTION_ID,
        metrics: { throughput: 4, avgDelay: 4.2 },
        layout: awajiStationLayout,
        initialTrains: [
            // Kyoto Main Line Eastbound -> Platform 5 -> KML East Exit
            { id: 'T_KML_EB', baseSpeed: 80, platformHaltDuration: 2, startTime: 0, priority: 'high', path: ['KML_W_IN-J_W1', 'J_W1-J_P45_W', 'J_P45_W-P5', 'P5-J_P45_E', 'J_P45_E-KML_E_OUT']},
            // Senri Line Northbound -> Platform 5 -> KML East Exit (merging)
            { id: 'T_SL_NB', baseSpeed: 70, platformHaltDuration: 2, startTime: 2, priority: 'high', path: ['SL_S_IN-J_SL_S_NB', 'J_SL_S-P5', 'P5-J_SL_N_X', 'J_SL_N-SL_N_OUT_2']},
            // Kyoto Main Line Westbound -> Platform 3 -> KML West Exit
            { id: 'T_KML_WB', baseSpeed: 80, platformHaltDuration: 2, startTime: 1, priority: 'high', path: ['KML_E_IN-J_P45_E', 'J_P45_E-P3_X', 'J_P23_E-P3', 'P3-J_P23_W', 'J_P23_W-J_W1', 'J_W1-KML_W_OUT']},
            // Senri Line Southbound -> Platform 2 -> Senri South Exit
            { id: 'T_SL_SB', baseSpeed: 70, platformHaltDuration: 2, startTime: 3, priority: 'high', path: ['SL_N_IN-J_SL_N', 'J_SL_N-P2', 'P2-J_W1_X', 'J_W1-J_SL_S', 'J_SL_S-SL_S_OUT']},
        ],
        config: {}
    }
}
