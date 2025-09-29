'use client';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Section, Station, Track } from '@/lib/schema';
import { stations as allStations, tracks as allTracks, blocks as allBlocks, trains as allTrains } from '@/lib/data';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix for default icon path in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const getBlockColor = (blockId: string) => {
    const block = allBlocks[blockId];
    if (!block) return '#888'; // Default color
    if (block.occupiedBy) return '#ef4444'; // Red for occupied
    // Could add 'reserved' state later
    return '#22c55e'; // Green for free
};

const getTrainIcon = (trainType: string) => {
    const typeClass = `train-icon-${trainType}`;
    return L.divIcon({
      html: `<div class="w-3 h-3 rounded-full ${typeClass} border-2 border-white"></div>`,
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
};

const interpolatePosition = (from: Station, to: Station, percentage: number) => {
    return {
        lat: from.lat + (to.lat - from.lat) * percentage,
        lng: from.lng + (to.lng - from.lng) * percentage
    };
}


export function MapComponent({ section }: { section: Section }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const sectionStations: Station[] = section.stationList.map(id => allStations[id]).filter(Boolean);
  const sectionTracks = Object.values(allTracks).filter(t => section.stationList.includes(t.fromStation) && section.stationList.includes(t.toStation));

  useEffect(() => {
    // This is a workaround for a known issue with react-leaflet and React StrictMode.
    // It ensures that the map container is cleaned up properly on re-renders.
    const mapEl = mapRef.current;
    if (mapEl && (mapEl as any)._leaflet_container) {
      (mapEl as any)._leaflet_container.remove();
    }
  }, []);

  if (sectionStations.length === 0) return <div>No stations to display on map.</div>;

  const center: L.LatLngExpression = [sectionStations[0].lat, sectionStations[0].lng];
  const bounds = L.latLngBounds(sectionStations.map(s => [s.lat, s.lng]));
  
  return (
    <div className="w-full h-full" ref={mapRef}>
        <MapContainer center={center} zoom={10} scrollWheelZoom={true} className="w-full h-full" bounds={bounds}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {sectionStations.map(station => (
            <Marker key={station.id} position={[station.lat, station.lng]}>
            <Popup>
                {station.name} ({station.id}) <br /> Platforms: {station.platforms}
            </Popup>
            <Tooltip direction="top" offset={[0,-10]} opacity={1} permanent>
                {station.id}
            </Tooltip>
            </Marker>
        ))}
        
        {sectionTracks.map(track => {
            const fromStation = allStations[track.fromStation];
            const toStation = allStations[track.toStation];
            if (!fromStation || !toStation) return null;

            const totalDistance = track.distance_m;
            return track.blockIds.map(blockId => {
                const block = allBlocks[blockId];
                if(!block) return null;
                
                const startPos = interpolatePosition(fromStation, toStation, block.start_km * 1000 / totalDistance);
                const endPos = interpolatePosition(fromStation, toStation, block.end_km * 1000 / totalDistance);

                return (
                    <Polyline key={block.id} positions={[[startPos.lat, startPos.lng], [endPos.lat, endPos.lng]]} color={getBlockColor(block.id)} weight={4}>
                        <Tooltip sticky>{`Block: ${block.id}`}{block.occupiedBy && ` | Train: ${allTrains[block.occupiedBy]?.trainNo}`}</Tooltip>
                    </Polyline>
                )
            })
        })}

        {Object.values(allTrains).map(train => {
            if (train.position.type === 'station' || !train.position.offset_km) return null;
            
            const block = allBlocks[train.position.id];
            if(!block) return null;

            const track = allTracks[block.trackId];
            const fromStation = allStations[track.fromStation];
            const toStation = allStations[track.toStation];
            if (!fromStation || !toStation) return null;

            const percentage = (block.start_km + train.position.offset_km) * 1000 / track.distance_m;
            const pos = interpolatePosition(fromStation, toStation, percentage);

            return (
                <Marker key={train.id} position={[pos.lat, pos.lng]} icon={getTrainIcon(train.type)}>
                    <Tooltip direction="right" offset={[10,0]}>
                        <b>{train.trainNo} ({train.type})</b><br/>
                        Status: {train.status}<br/>
                        Speed: {train.currentSpeed_kmph} km/h
                    </Tooltip>
                </Marker>
            )
        })}
        </MapContainer>
    </div>
  );
}
