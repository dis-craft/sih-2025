export type TrainSchedule = {
  id: string;
  trainName: string;
  origin: string;
  destination:string;
  departureTime: string;
  arrivalTime: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
};

export const trainSchedules: TrainSchedule[] = [
  { id: 'TRN101', trainName: 'Metro Express', origin: 'Central Station', destination: 'Northwood', departureTime: '08:00', arrivalTime: '09:30', status: 'On Time'},
  { id: 'TRN102', trainName: 'City Link', origin: 'Eastville', destination: 'Westwood', departureTime: '08:15', arrivalTime: '10:00', status: 'Delayed'},
  { id: 'TRN103', trainName: 'River Runner', origin: 'South Point', destination: 'Central Station', departureTime: '08:30', arrivalTime: '09:45', status: 'On Time'},
  { id: 'TRN104', trainName: 'Coastal Cruiser', origin: 'Northwood', destination: 'South Point', departureTime: '09:00', arrivalTime: '11:30', status: 'Cancelled'},
  { id: 'TRN105', trainName: 'Mountain Mover', origin: 'Westwood', destination: 'Eastville', departureTime: '09:45', arrivalTime: '11:15', status: 'On Time'},
  { id: 'TRN106', trainName: 'Suburban Shuttle', origin: 'Central Station', destination: 'Greenfield', departureTime: '10:00', arrivalTime: '10:45', status: 'On Time'},
];


export type LiveStatus = {
  id: string;
  trainName: string;
  currentLocation: string;
  nextStation: string;
  status: 'On Time' | 'Delayed' | 'Arrived' | 'Departed';
  delayMinutes?: number;
};

export const liveStatuses: LiveStatus[] = [
    { id: 'TRN101', trainName: 'Metro Express', currentLocation: 'Passing Oakhaven', nextStation: 'Maple Creek', status: 'On Time' },
    { id: 'TRN102', trainName: 'City Link', currentLocation: 'Approaching Eastville', nextStation: 'Eastville', status: 'Delayed', delayMinutes: 25 },
    { id: 'TRN103', trainName: 'River Runner', currentLocation: 'At South Point', nextStation: 'Departing...', status: 'Departed' },
    { id: 'TRN105', trainName: 'Mountain Mover', currentLocation: 'Arrived at Eastville', nextStation: '-', status: 'Arrived' },
];

export type LocoRequest = {
  id: string;
  pilot: string;
  trainId: string;
  requestType: 'Track Clearance' | 'Rerouting' | 'Maintenance' | 'Emergency';
  message: string;
  timestamp: string;
  status: 'Pending' | 'Approved' | 'Denied';
};

export const locoRequests: LocoRequest[] = [
    { id: 'REQ001', pilot: 'John Doe', trainId: 'TRN102', requestType: 'Rerouting', message: 'Requesting reroute via Line B due to signal failure on Line A.', timestamp: '2024-07-29 08:20:15', status: 'Pending' },
    { id: 'REQ002', pilot: 'Jane Smith', trainId: 'TRN106', requestType: 'Track Clearance', message: 'Debris reported on track near Greenfield. Requesting clearance confirmation.', timestamp: '2024-07-29 09:55:00', status: 'Approved' },
    { id: 'REQ003', pilot: 'Mike Ross', trainId: 'TRN105', requestType: 'Maintenance', message: 'Minor issue with door mechanism on car 3. Requesting check at next major stop.', timestamp: '2024-07-29 10:10:45', status: 'Pending' },
];

export type SavedRoute = {
  id: string;
  origin: string;
  destination: string;
  alertsEnabled: boolean;
};

export const savedRoutes: SavedRoute[] = [
    { id: 'ROUTE01', origin: 'Central Station', destination: 'Northwood', alertsEnabled: true },
    { id: 'ROUTE02', origin: 'Westwood', destination: 'Eastville', alertsEnabled: false },
    { id: 'ROUTE03', origin: 'South Point', destination: 'Central Station', alertsEnabled: true },
];
