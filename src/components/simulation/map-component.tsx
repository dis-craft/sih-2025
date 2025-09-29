'use client';
import { useRef, useEffect, useState } from 'react';
import type { Section } from '@/lib/schema';
import { useSimulation } from '@/hooks/use-simulation';
import { simulationCases } from '@/lib/simulation-cases';
import { allTrains } from '@/lib/data';

const trackColor = '#4b5563'; // gray-600
const stationColor = '#e5e7eb'; // gray-200
const trainColors: { [key: string]: string } = {
  express: '#f97316', // orange-500
  passenger: '#3b82f6', // blue-500
  freight: '#6b7280', // gray-500
  emergency: '#ef4444', // red-500
};

const statusColors: { [key in ReturnType<typeof useSimulation>['trains'][0]['status']]: string } = {
    'on-time': '#22c55e', // green-500
    'slowing': '#facc15', // yellow-400
    'stopped': '#ef4444', // red-500
    'delayed': '#f97316', // orange-500
    'conflict': '#dc2626', // red-600
}

export function MapComponent({ section, caseId }: { section: Section, caseId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trains } = useSimulation(caseId);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 0.8 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const simCase = simulationCases[caseId];
  if (!simCase) {
    return <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg text-white">Invalid Simulation Case ID</div>;
  }
  const { layout } = simCase;

  const getPointOnPath = (pathName: string, t: number) => {
      const path = layout.paths[pathName as keyof typeof layout.paths];
      if (!path) return { x: 0, y: 0 };
      const from = layout.points[path[0] as keyof typeof layout.points];
      const to = layout.points[path[1] as keyof typeof layout.points];
      if (!from || !to) return {x: 0, y: 0};
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoomFactor = 1.1;
        
        let newZoom;
        if (e.deltaY < 0) {
            newZoom = view.zoom * zoomFactor;
        } else {
            newZoom = view.zoom / zoomFactor;
        }
        newZoom = Math.max(0.2, Math.min(newZoom, 5));

        const worldX = (mouseX - view.x) / view.zoom;
        const worldY = (mouseY - view.y) / view.zoom;

        setView({
            zoom: newZoom,
            x: mouseX - worldX * newZoom,
            y: mouseY - worldY * newZoom
        });
    };

    const handleMouseDown = (e: MouseEvent) => {
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => { setIsPanning(false); };
    const handleMouseLeave = () => { setIsPanning(false); };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isPanning) return;
        const dx = e.clientX - lastPanPoint.x;
        const dy = e.clientY - lastPanPoint.y;
        setView(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
        setLastPanPoint({ x: e.clientX, y: e.clientY });
    };
    
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
        if (canvas) {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('mousemove', handleMouseMove);
        }
    };

  }, [isPanning, lastPanPoint, view.zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const parent = canvas.parentElement;
    if(!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    let animationFrameId: number;
    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(view.x, view.y);
        ctx.scale(view.zoom, view.zoom);

        // --- Draw Tracks ---
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = 3 / view.zoom;
        Object.values(layout.paths).forEach(path => {
            const from = layout.points[path[0] as keyof typeof layout.points];
            const to = layout.points[path[1] as keyof typeof layout.points];
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });

        // --- Draw Junction/Station Points ---
        ctx.fillStyle = stationColor;
        ctx.strokeStyle = '#9ca3af'; // gray-400
        ctx.lineWidth = 2 / view.zoom;
        Object.entries(layout.points).forEach(([key, p]) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8 / view.zoom, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            if (p.label) {
                ctx.fillStyle = '#000';
                ctx.font = `bold ${10 / view.zoom}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.label, p.x, p.y);
            }
        });

        // --- Draw Trains ---
        trains.forEach(train => {
            const point = getPointOnPath(train.path, train.progress);
            if(point.x === 0 && point.y === 0) return;

            // Train Body
            ctx.fillStyle = trainColors[train.type] || '#fff';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 10 / view.zoom, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5 / view.zoom;
            ctx.stroke();

            // Micro-details text
            ctx.fillStyle = '#fff';
            ctx.font = `${12 / view.zoom}px sans-serif`;
            ctx.textAlign = 'left';
            const speedKmph = (train.speed / train.maxSpeed * (allTrains[train.id]?.maxSpeed_kmph || 90)).toFixed(0);
            
            const textLines = [
                `ID: ${train.id}`,
                `Spd: ${speedKmph} km/h`,
                `Status: ${train.status}`,
            ];
            
            textLines.forEach((line, index) => {
                ctx.fillText(line, point.x + 15 / view.zoom, point.y + (5 / view.zoom) + (index * 14 / view.zoom));
            });

            // Status Indicator on train
            ctx.fillStyle = statusColors[train.status] || '#fff';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4 / view.zoom, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        ctx.restore();
        animationFrameId = window.requestAnimationFrame(render);
    }
    render();
    
    return () => {
        window.cancelAnimationFrame(animationFrameId);
    };

  }, [trains, view, layout]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-gray-800 rounded-lg" />;
}
