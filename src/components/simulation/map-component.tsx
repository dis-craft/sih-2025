'use client';
import { useRef, useEffect } from 'react';
import { Section, Station } from '@/lib/schema';
import { stations as allStations, tracks as allTracks, blocks as allBlocks, trains as allTrains } from '@/lib/data';

const trainColors: { [key: string]: string } = {
  express: '#f97316', // orange-500
  passenger: '#3b82f6', // blue-500
  freight: '#6b7280', // gray-500
  emergency: '#ef4444', // red-500
};

const blockColors = {
  occupied: '#ef4444',
  free: '#22c55e'
}

export function MapComponent({ section }: { section: Section }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sectionStations: Station[] = section.stationList
    .map((id) => allStations[id])
    .filter(Boolean);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const parent = canvas.parentElement;
    if(!parent) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const { width, height } = parent;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // --- Layout Stations ---
    const stationPositions: Map<string, { x: number; y: number }> = new Map();
    const padding = 60;
    const stationCount = sectionStations.length;
    sectionStations.forEach((station, index) => {
      const x = padding + (index / (stationCount - 1)) * (width - padding * 2);
      const y = height / 2;
      stationPositions.set(station.id, { x, y });
    });

    // --- Draw Tracks and Blocks ---
    Object.values(allTracks).forEach(track => {
      if (section.stationList.includes(track.fromStation) && section.stationList.includes(track.toStation)) {
        const fromPos = stationPositions.get(track.fromStation);
        const toPos = stationPositions.get(track.toStation);
        if (!fromPos || !toPos) return;

        track.blockIds.forEach(blockId => {
            const block = allBlocks[blockId];
            if (!block) return;
            
            const startX = fromPos.x + (toPos.x - fromPos.x) * (block.start_km * 1000 / track.distance_m);
            const endX = fromPos.x + (toPos.x - fromPos.x) * (block.end_km * 1000 / track.distance_m);

            ctx.strokeStyle = block.occupiedBy ? blockColors.occupied : blockColors.free;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(startX, fromPos.y);
            ctx.lineTo(endX, fromPos.y);
            ctx.stroke();
        });
      }
    });

    // --- Draw Stations ---
    stationPositions.forEach((pos, stationId) => {
      const station = allStations[stationId];
      ctx.fillStyle = '#94a3b8'; // slate-400
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0'; // slate-200
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(station.id, pos.x, pos.y + 25);
    });

    // --- Draw Trains ---
     Object.values(allTrains).forEach(train => {
        if (train.position.type === 'block' && train.position.offset_km) {
            const block = allBlocks[train.position.id];
            if (!block) return;

            const track = allTracks[block.trackId];
            if (!track || !section.stationList.includes(track.fromStation)) return;

            const fromPos = stationPositions.get(track.fromStation);
            const toPos = stationPositions.get(track.toStation);

            if(!fromPos || !toPos) return;
            
            const percentage = ((block.start_km + train.position.offset_km) * 1000) / track.distance_m;
            const x = fromPos.x + (toPos.x - fromPos.x) * percentage;
            const y = fromPos.y - 15; // Offset trains above track

            ctx.fillStyle = trainColors[train.type] || '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(train.trainNo, x, y - 10);
        }
     });


  }, [section, sectionStations]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
