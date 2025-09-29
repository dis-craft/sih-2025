import { Train, Station, Track, Block, Request, Section, Simulation, Controller, AuditEvent } from "./schema";

export const controllers: Record<string, Controller> = {
    "C01": { id: "C01", name: "Anand Kumar", email: "anand.kumar@rail.gov.in", managedSections: ["SBC-MYS", "KSR-Central"] },
};

export const sections: Record<string, Section> = {
    "SBC-MYS": {
        id: "SBC-MYS",
        name: "Bengaluru - Mysuru",
        stationList: ["SBC", "KGI", "MYA", "MYS"],
        length_km: 138,
        controllerId: "C01",
        mode: "double"
    },
    "KSR-Central": {
        id: "KSR-Central",
        name: "KSR Bengaluru Yard",
        stationList: ["SBC", "BNC"],
        length_km: 5,
        controllerId: "C01",
        mode: "double"
    }
};

export const stations: Record<string, Station> = {
    "SBC": { id: "SBC", name: "Bengaluru City (SBC)", lat: 12.9759, lng: 77.5717, platforms: 10, type: "junction" },
    "KGI": { id: "KGI", name: "Kengeri", lat: 12.9154, lng: 77.4839, platforms: 4, type: "regular"},
    "MYA": { id: "MYA", name: "Mandya", lat: 12.5252, lng: 76.8951, platforms: 3, type: "regular"},
    "MYS": { id: "MYS", name: "Mysuru Jn", lat: 12.3146, lng: 76.6436, platforms: 6, type: "junction" },
    "BNC": { id: "BNC", name: "Bengaluru Cantt.", lat: 12.9929, lng: 77.6083, platforms: 3, type: "regular"}
};

export const tracks: Record<string, Track> = {
    "TRK01": { id: "TRK01", fromStation: "SBC", toStation: "KGI", lineType: "double", distance_m: 12000, maxSpeed_kmph: 90, blockIds: ["B01", "B02", "B03"] },
    "TRK02": { id: "TRK02", fromStation: "KGI", toStation: "MYA", lineType: "double", distance_m: 81000, maxSpeed_kmph: 110, blockIds: ["B04", "B05", "B06", "B07", "B08", "B09"] },
    "TRK03": { id: "TRK03", fromStation: "MYA", toStation: "MYS", lineType: "double", distance_m: 45000, maxSpeed_kmph: 100, blockIds: ["B10", "B11", "B12"] },
    "TRK04": { id: "TRK04", fromStation: "SBC", toStation: "BNC", lineType: "double", distance_m: 5000, maxSpeed_kmph: 60, blockIds: ["Y01", "Y02"]},
};

export const blocks: Record<string, Block> = {
    "B01": { id: "B01", trackId: "TRK01", start_km: 0, end_km: 4, occupiedBy: null, signalId: "S01" },
    "B02": { id: "B02", trackId: "TRK01", start_km: 4, end_km: 8, occupiedBy: "T12613", signalId: "S02" },
    "B03": { id: "B03", trackId: "TRK01", start_km: 8, end_km: 12, occupiedBy: null, signalId: "S03" },
    "B04": { id: "B04", trackId: "TRK02", start_km: 12, end_km: 25, occupiedBy: null, signalId: "S04" },
    "B05": { id: "B05", trackId: "TRK02", start_km: 25, end_km: 38, occupiedBy: null, signalId: "S05" },
    "B06": { id: "B06", trackId: "TRK02", start_km: 38, end_km: 51, occupiedBy: null, signalId: "S06" },
    "B07": { id: "B07", trackId: "TRK02", start_km: 51, end_km: 64, occupiedBy: null, signalId: "S07" },
    "B08": { id: "B08", trackId: "TRK02", start_km: 64, end_km: 77, occupiedBy: "T16216", signalId: "S08" },
    "B09": { id: "B09", trackId: "TRK02", start_km: 77, end_km: 93, occupiedBy: null, signalId: "S09" },
    "B10": { id: "B10", trackId: "TRK03", start_km: 93, end_km: 108, occupiedBy: null, signalId: "S10" },
    "B11": { id: "B11", trackId: "TRK03", start_km: 108, end_km: 123, occupiedBy: "T20660", signalId: "S11" },
    "B12": { id: "B12", trackId: "TRK03", start_km: 123, end_km: 138, occupiedBy: null, signalId: "S12" },
    "Y01": { id: "Y01", trackId: "TRK04", start_km: 0, end_km: 2.5, occupiedBy: "T12345", signalId: "SY01" },
    "Y02": { id: "Y02", trackId: "TRK04", start_km: 2.5, end_km: 5, occupiedBy: null, signalId: "SY02" },
};

export const trains: Record<string, Train> = {
    "T12613": { id: "T12613", trainNo: "12613", type: "express", priority: 2, length_m: 450, maxSpeed_kmph: 110, acceleration_mps2: 0.4, braking_mps2: 0.8, currentState: "in_section", position: { type: "block", id: "B02", offset_km: 2.1 }, eta_next: new Date(Date.now() + 5 * 60 * 1000).toISOString(), origin: "SBC", destination: "MYS", status: "on_time", currentSpeed_kmph: 85 },
    "T16216": { id: "T16216", trainNo: "16216", type: "passenger", priority: 4, length_m: 300, maxSpeed_kmph: 90, acceleration_mps2: 0.6, braking_mps2: 1.0, currentState: "in_section", position: { type: "block", id: "B08", offset_km: 1.5 }, eta_next: new Date(Date.now() + 12 * 60 * 1000).toISOString(), origin: "SBC", destination: "MYS", status: "delayed", status_details: "+15min", currentSpeed_kmph: 70 },
    "T20660": { id: "T20660", trainNo: "20660", type: "express", priority: 2, length_m: 400, maxSpeed_kmph: 120, acceleration_mps2: 0.5, braking_mps2: 0.9, currentState: "in_section", position: { type: "block", id: "B11", offset_km: 10.3 }, eta_next: new Date(Date.now() + 8 * 60 * 1000).toISOString(), origin: "SBC", destination: "MYS", status: "on_time", currentSpeed_kmph: 105 },
    "F5678": { id: "F5678", trainNo: "F5678", type: "freight", priority: 8, length_m: 800, maxSpeed_kmph: 75, acceleration_mps2: 0.2, braking_mps2: 0.4, currentState: "approaching", position: { type: "station", id: "SBC" }, eta_next: new Date(Date.now() + 25 * 60 * 1000).toISOString(), origin: "SBC", destination: "MYS", status: "on_time", currentSpeed_kmph: 0 },
    "T12345": { id: "T12345", trainNo: "12345", type: "express", priority: 3, length_m: 420, maxSpeed_kmph: 100, acceleration_mps2: 0.5, braking_mps2: 0.7, currentState: "in_section", position: { type: "block", id: "Y01", offset_km: 1 }, eta_next: new Date(Date.now() + 2 * 60 * 1000).toISOString(), origin: "SBC", destination: "BNC", status: "on_time", currentSpeed_kmph: 50 },
    "EM01": { id: "EM01", trainNo: "EM01", type: "emergency", priority: 0, length_m: 100, maxSpeed_kmph: 120, acceleration_mps2: 0.8, braking_mps2: 1.2, currentState: "approaching", position: { type: "station", id: "KGI" }, eta_next: new Date(Date.now() + 1 * 60 * 1000).toISOString(), origin: "KGI", destination: "MYA", status: "on_time", currentSpeed_kmph: 0 },
};

export const requests: Record<string, Request> = {
    "REQ001": { id: "REQ001", trainId: "F5678", sectionId: "SBC-MYS", requestType: "enter_section", requestedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), proposedEntryTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), proposedSpeed: 60, status: "pending" },
    "REQ002": { id: "REQ002", trainId: "T16216", sectionId: "SBC-MYS", requestType: "reroute", requestedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), decisionNote: "Signal failure on main line, requesting switch to loop line.", status: "approved", reviewedBy: "C01" },
    "REQ003": { id: "REQ003", trainId: "EM01", sectionId: "SBC-MYS", requestType: "enter_section", requestedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(), proposedEntryTime: new Date(Date.now() + 1 * 60 * 1000).toISOString(), proposedSpeed: 110, status: "pending", priority: 0 },
};

export const simulations: Record<string, Simulation> = {
    "SIM01": { id: "SIM01", sectionId: "SBC-MYS", status: "running", startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(), currentTimeStep: 1234, timeStepSec: 5, metrics: { throughput: 5, avgDelay: 12.5 } },
    "SIM02": { id: "SIM02", sectionId: "KSR-Central", status: "paused", startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), currentTimeStep: 500, timeStepSec: 5, metrics: { throughput: 10, avgDelay: 2.1 } }
};

export const events: AuditEvent[] = [
    { id: "EVT001", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), type: "request_decision", actor: "C01", details: { requestId: "REQ002", decision: "approved", reason: "Signal failure confirmed. Rerouting to loop line to avoid further delay."} },
    { id: "EVT002", timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), type: "simulation_control", actor: "C01", details: { simId: "SIM02", action: "paused", reason: "Low traffic period." } },
];
