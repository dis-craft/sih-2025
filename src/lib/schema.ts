// Firestore Data Model

export interface Network {
    id: string;
    name: string;
    stations: string[]; // array of station IDs
    tracks: string[]; // array of track IDs
}

export interface Station {
    id: string;
    name: string;
    lat: number;
    lng: number;
    platforms: number;
    type: 'junction' | 'regular';
}

export interface Track {
    id: string;
    fromStation: string; // stationId
    toStation: string; // stationId
    lineType: 'single' | 'double';
    distance_m: number;
    maxSpeed_kmph: number;
    blockIds: string[];
}

export interface Block {
    id: string;
    trackId: string;
    start_km: number;
    end_km: number;
    occupiedBy: string | null; // trainId
    signalId: string;
}

export interface Train {
    id: string;
    trainNo: string;
    type: 'express' | 'freight' | 'passenger' | 'emergency';
    priority: number; // 0 for emergency, then 1..10
    length_m: number;
    maxSpeed_kmph: number;
    acceleration_mps2: number;
    braking_mps2: number;
    currentState: 'approaching' | 'in_section' | 'holding' | 'at_station';
    position: {
        type: 'station' | 'block';
        id: string;
        offset_km?: number;
    };
    eta_next: string; // ISO 8601 timestamp for arrival at next significant point
    origin: string; // stationId
    destination: string; // stationId
    status: 'on_time' | 'delayed' | 'blocked';
    status_details?: string;
    currentSpeed_kmph: number;
}

export interface Request {
    id: string;
    trainId: string;
    sectionId: string;
    requestType: 'enter_section' | 'enter_platform' | 'reroute';
    requestedAt: string; // ISO 8601
    proposedEntryTime: string; // ISO 8601
    proposedSpeed: number;
    status: 'pending' | 'approved' | 'rejected' | 'modified' | 'held';
    reviewedBy?: string | null; // controllerId
    decisionNote?: string;
    priority?: number; // To handle emergency requests in queue
}

export interface Section {
    id: string;
    name: string;
    stationList: string[]; // ordered list of station IDs
    length_km: number;
    controllerId: string;
    mode: 'single' | 'double';
}

export interface Simulation {
    id: string;
    sectionId: string;
    status: 'running' | 'paused' | 'stopped';
    startTime: string; // ISO 8601
    currentTimeStep: number;
    timeStepSec: number;
    instanceUrl?: string; // Cloud Run instance
    metrics: {
        throughput: number;
        avgDelay: number;
    };
}

export interface AuditEvent {
    id: string;
    timestamp: string; // ISO 8601
    type: 'request_decision' | 'simulation_control' | 'system_alert';
    actor: string; // controllerId or 'system'
    details: Record<string, any>;
}

export interface Controller {
    id: string;
    name: string;
    email: string;
    managedSections: string[];
}
