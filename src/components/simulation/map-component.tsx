'use client';
import { useRef, useEffect } from 'react';
import { Section } from '@/lib/schema';
import { useSimulation } from '@/hooks/use-simulation';

const trackColor = '#e2e8f0'; // slate-200
const trainColors: { [key: string]: string } = {
  express: '#f97316', // orange-500
  passenger: '#3b82f6', // blue-500
  freight: '#6b7280', // gray-500
  emergency: '#ef4444', // red-500
};

// Manually defined track paths based on the image
const trackPaths = {
    // Incoming curved track from top
    path1: (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(100, 150);
        ctx.bezierCurveTo(250, 50, 450, 50, 600, 200);
        ctx.stroke();
    },
    // Incoming straight track
    path2: (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(100, 250);
        ctx.lineTo(600, 200);
        ctx.stroke();
    },
    // Incoming lower curve 1
    path3: (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(100, 350);
        ctx.bezierCurveTo(250, 450, 450, 450, 600, 300);
        ctx.stroke();
    },
     // Incoming lower curve 2
    path4: (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(100, 450);
        ctx.bezierCurveTo(250, 550, 450, 550, 600, 400);
        ctx.stroke();
    },
    // Outgoing straight tracks
    outPath1: (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(600, 200);
        ctx.lineTo(900, 200);
        ctx.stroke();
    },
    outPath2: (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(600, 300);
        ctx.lineTo(900, 300);
        ctx.stroke();
    },
    outPath3: (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.moveTo(600, 400);
        ctx.lineTo(900, 400);
        ctx.stroke();
    },
};

const getPointOnPath = (pathName: string, t: number) => {
    // Simple interpolation for demonstration. A real implementation would solve the bezier equation.
    switch(pathName) {
        case 'path1': 
            const t1 = 1 - t;
            const t1_2 = t1 * t1;
            const t1_3 = t1_2 * t1;
            const x1 = t1_3 * 100 + 3 * t1_2 * t * 250 + 3 * t1 * t * t * 450 + t * t * t * 600;
            const y1 = t1_3 * 150 + 3 * t1_2 * t * 50 + 3 * t1 * t * t * 50 + t * t * t * 200;
            return {x: x1, y: y1};
        case 'path2':
            return { x: 100 + (600 - 100) * t, y: 250 + (200 - 250) * t };
        case 'path3':
            const t3 = 1 - t;
            const t3_2 = t3 * t3;
            const t3_3 = t3_2 * t3;
            const x3 = t3_3 * 100 + 3 * t3_2 * t * 250 + 3 * t3 * t * t * 450 + t * t * t * 600;
            const y3 = t3_3 * 350 + 3 * t3_2 * t * 450 + 3 * t3 * t * t * 450 + t * t * t * 300;
            return {x: x3, y: y3};
        case 'path4':
            const t4 = 1 - t;
            const t4_2 = t4 * t4;
            const t4_3 = t4_2 * t4;
            const x4 = t4_3 * 100 + 3 * t4_2 * t * 250 + 3 * t4 * t * t * 450 + t * t * t * 600;
            const y4 = t4_3 * 450 + 3 * t4_2 * t * 550 + 3 * t4 * t * t * 550 + t * t * t * 400;
            return {x: x4, y: y4};
        case 'outPath1':
             return { x: 600 + (900 - 600) * t, y: 200 };
        case 'outPath2':
             return { x: 600 + (900 - 600) * t, y: 300 };
        case 'outPath3':
             return { x: 600 + (900 - 600) * t, y: 400 };
        default:
            return {x: 0, y: 0}
    }
}


export function MapComponent({ section }: { section: Section }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { trains } = useSimulation();

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
    
    const { width, height } = rect;

    // Animation loop
    let animationFrameId: number;
    const render = () => {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // --- Draw Tracks ---
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = 2;
        Object.values(trackPaths).forEach(drawPath => drawPath(ctx));

        // --- Draw Arrows ---
        ctx.fillStyle = trackColor;
        const drawArrow = (x: number, y: number) => {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 10, y - 5);
            ctx.lineTo(x - 10, y + 5);
            ctx.closePath();
            ctx.fill();
        }
        drawArrow(895, 200);
        drawArrow(895, 300);
        drawArrow(895, 400);


        // --- Draw Trains ---
        trains.forEach(train => {
            const point = getPointOnPath(train.path, train.progress);
            ctx.fillStyle = trainColors[train.type] || '#fff';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(train.id, point.x, point.y - 12);
        });

        animationFrameId = window.requestAnimationFrame(render);
    }
    render();
    
    return () => {
        window.cancelAnimationFrame(animationFrameId);
    };

  }, [trains]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
