'use client';
import { useRef, useEffect, useState } from 'react';
import type { Section } from '@/lib/schema';
import { useSimulation } from '@/hooks/use-simulation';
import { simulationCases } from '@/lib/simulation-cases';
import { allTrains as staticTrainData } from '@/lib/data';

const trackColor = '#4b5563'; // gray-600
const stationColor = '#e5e7eb'; // gray-200
const trainColors: { [key: string]: string } = {
  express: '#f97316', // orange-500
  passenger: '#3b82f6', // blue-500
  freight: '#6b7280', // gray-500
  emergency: '#ef4444', // red-500
};

const statusColors: { [key: string]: string } = {
    'on-time': '#22c55e', // green-500
    'slowing': '#facc15', // yellow-400
    'stopped': '#ef4444', // red-500
    'delayed': '#f97316', // orange-500
    'conflict': '#dc2626', // red-600,
    'in-siding': '#9333ea', // purple-600
    'at-platform': '#2563eb' // blue-600
}

export function MapComponent({ section, caseId }: { section: Section, caseId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trains, simulationTime } = useSimulation(caseId);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 0.8 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const simCase = simulationCases[caseId];
  if (!simCase) {
    return <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg text-white">Invalid Simulation Case ID</div>;
  }
  const { layout } = simCase;

  const getPointForPosition = (trackId: string, mile: number) => {
    const trackLayout = layout.tracks[trackId];
    if (!trackLayout) return null;
    const fromPoint = layout.points[trackLayout.points[0]];
    const toPoint = layout.points[trackLayout.points[1]];
    if (!fromPoint || !toPoint) return null;

    const percentage = mile / 20; // 20 miles total length
    return {
        x: fromPoint.x + (toPoint.x - fromPoint.x) * percentage,
        y: fromPoint.y + (toPoint.y - fromPoint.y) * percentage
    };
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

        // --- Draw Tracks and Blocks ---
        ctx.lineWidth = 3 / view.zoom;
        Object.values(layout.tracks).forEach(trackLayout => {
            const from = layout.points[trackLayout.points[0]];
            const to = layout.points[trackLayout.points[1]];
            ctx.strokeStyle = layout.config.trackColor || trackColor;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });

        // --- Draw Blocks and Stations ---
        ctx.lineWidth = 1 / view.zoom;
        Object.values(layout.points).forEach(p => {
             if (p.label) {
                ctx.fillStyle = stationColor;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8 / view.zoom, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = '#000';
                ctx.font = `bold ${10 / view.zoom}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.label, p.x, p.y);
            }
        });


        // --- Draw Trains ---
        trains.forEach(train => {
            const point = getPointForPosition(train.track, train.position);
            if(!point) return;

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
            const staticData = staticTrainData[train.id];

            const textLines = [
                `ID: ${staticData?.trainNo || train.id}`,
                `Spd: ${train.speed.toFixed(0)} mph`,
                `Pos: ${train.position.toFixed(2)} mi`,
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

        // --- Draw Sim Time ---
        ctx.fillStyle = 'white';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Sim Time: 7:${String(Math.floor(simulationTime)).padStart(2,'0')}:${String(Math.floor((simulationTime % 1) * 60)).padStart(2,'0')} PM`, canvas.width/dpr - 10, 20);

        animationFrameId = window.requestAnimationFrame(render);
    }
    render();
    
    return () => {
        window.cancelAnimationFrame(animationFrameId);
    };

  }, [trains, simulationTime, view, layout, caseId]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-gray-800 rounded-lg" />;
}
