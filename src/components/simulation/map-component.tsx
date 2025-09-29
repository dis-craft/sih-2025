'use client';
import { useRef, useEffect, useState } from 'react';
import type { Section } from '@/lib/schema';
import { useSimulation } from '@/hooks/use-simulation';
import { simulationCases } from '@/lib/simulation-cases';
import { allTrains as staticTrainData } from '@/lib/data';

const statusColors: { [key: string]: string } = {
    'on-time': '#22c55e', // green-500
    'slowing': '#facc15', // yellow-400
    'stopped': '#ef4444', // red-500
    'delayed': '#f97316', // orange-500
    'conflict': '#dc2626', // red-600,
    'in-siding': '#9333ea', // purple-600
    'at-platform': '#2563eb', // blue-600
    'breakdown': '#be123c', // rose-700
    'finished': '#4b5563', // gray-600
}

export function MapComponent({ section, caseId }: { section: Section, caseId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trains, simulationTime } = useSimulation(caseId);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 0.8 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const simCase = simulationCases[caseId];
  if (!simCase) {
    return <div className="flex items-center justify-center h-full bg-card rounded-lg text-foreground">Invalid Simulation Case ID</div>;
  }
  const { layout } = simCase;

  const getPointForPosition = (trackId: string, mile: number, currentLayout: typeof layout) => {
    const trackLayout = currentLayout.tracks[trackId];
    if (!trackLayout) return null;
    
    const fromPoint = currentLayout.points[trackLayout.points[0]];
    const toPoint = currentLayout.points[trackLayout.points[1]];
    if (!fromPoint || !toPoint) return null;

    const startMile = fromPoint.mile;
    const endMile = toPoint.mile;
    const trackLength = Math.abs(endMile - startMile);

    if (trackLength === 0) return { x: fromPoint.x, y: fromPoint.y };
    
    // Ensure t is between 0 and 1
    const t = Math.max(0, Math.min(1, (mile - startMile) / trackLength));

    let cp1 = trackLayout.controlPoints?.[0];
    let cp2 = trackLayout.controlPoints?.[1];

    // Resolve string references to actual points
    if (typeof cp1 === 'string') cp1 = currentLayout.points[cp1];
    if (typeof cp2 === 'string') cp2 = currentLayout.points[cp2];


    if (cp1 && cp2) { // Cubic Bezier
      const x = (1-t)**3 * fromPoint.x + 3*(1-t)**2 * t * cp1.x + 3*(1-t) * t**2 * cp2.x + t**3 * toPoint.x;
      const y = (1-t)**3 * fromPoint.y + 3*(1-t)**2 * t * cp1.y + 3*(1-t) * t**2 * cp2.y + t**3 * toPoint.y;
      return { x, y };
    } else if (cp1) { // Quadratic Bezier
        const x = (1-t)**2 * fromPoint.x + 2*(1-t)*t * cp1.x + t**2 * toPoint.x;
        const y = (1-t)**2 * fromPoint.y + 2*(1-t)*t * cp1.y + t**2 * toPoint.y;
        return { x, y };
    } else { // Linear
      return {
          x: fromPoint.x + (toPoint.x - fromPoint.x) * t,
          y: fromPoint.y + (toPoint.y - fromPoint.y) * t,
      };
    }
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
        ctx.lineWidth = 4 / view.zoom;
        ctx.strokeStyle = layout.config.trackColor;
        ctx.globalAlpha = 0.8;
        Object.values(layout.tracks).forEach(trackLayout => {
            const from = layout.points[trackLayout.points[0]];
            const to = layout.points[trackLayout.points[1]];
            if (!from || !to) return;
            
            let cp1 = trackLayout.controlPoints?.[0];
            let cp2 = trackLayout.controlPoints?.[1];

            if (typeof cp1 === 'string') cp1 = layout.points[cp1];
            if (typeof cp2 === 'string') cp2 = layout.points[cp2];

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            if (cp1 && cp2) {
                ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, to.x, to.y);
            } else if (cp1) {
                ctx.quadraticCurveTo(cp1.x, cp1.y, to.x, to.y);
            } else {
                ctx.lineTo(to.x, to.y);
            }
            ctx.stroke();
        });
        ctx.globalAlpha = 1;


        // --- Draw Stations / Points ---
        Object.values(layout.points).forEach(p => {
             if (p.label) {
                ctx.fillStyle = p.isPlatform ? layout.config.platformColor : layout.config.stationColor;
                if(p.isPlatform) {
                  ctx.fillRect(p.x - 50/view.zoom, p.y - 10/view.zoom, 100/view.zoom, 20/view.zoom);
                } else {
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, (p.isPlatform ? 10 : 7) / view.zoom, 0, 2 * Math.PI);
                  ctx.fill();
                }
                
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${12 / view.zoom}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(p.label, p.x, p.y - (15 / view.zoom));
            }
        });


        // --- Draw Trains ---
        trains.forEach(train => {
            if (train.position < 0 || train.status === 'finished') return;
            const point = getPointForPosition(train.track, train.position, layout);
            if(!point) return;

            // Train Body
            const staticData = staticTrainData[train.id];
            const trainColor = staticData ? (staticData.type === 'passenger' ? '#3b82f6' : staticData.type === 'express' ? '#10b981' : '#6b7280') : '#fff';
            
            ctx.fillStyle = trainColor;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8 / view.zoom, 0, 2 * Math.PI);
            ctx.fill();
            
            // Status Ring
            ctx.strokeStyle = statusColors[train.status] || '#fff';
            ctx.lineWidth = 2.5 / view.zoom;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 11 / view.zoom, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Micro-details text
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${10 / view.zoom}px sans-serif`;
            ctx.textAlign = 'left';
            
            const textLines = [
                `${train.id}`,
                `${train.speed.toFixed(0)} mph`,
                `${train.status}`,
            ];
            
            textLines.forEach((line, index) => {
                ctx.fillText(line, point.x + 18 / view.zoom, point.y - (8 / view.zoom) + (index * 12 / view.zoom));
            });
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

  return <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-card rounded-lg" />;
}
