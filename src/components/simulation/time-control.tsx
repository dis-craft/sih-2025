'use client';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { Simulation } from '@/lib/schema';


const statusVariantMap: { [key in Simulation['status']]: 'default' | 'secondary' | 'destructive' } = {
    running: 'default',
    paused: 'secondary',
    stopped: 'destructive',
  };

export function TimeControl({ 
    simStatus,
    onPlay,
    onPause,
    onStep,
    onReset
}: { 
    simStatus: Simulation['status'],
    onPlay: () => void,
    onPause: () => void,
    onStep: () => void,
    onReset: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Simulation Control</CardTitle>
        <Badge variant={statusVariantMap[simStatus]} className="capitalize">{simStatus}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPlay} disabled={simStatus === 'running'}>
            <Play className="h-4 w-4" />
            <span className="sr-only">Play</span>
          </Button>
          <Button variant="outline" size="icon" onClick={onPause} disabled={simStatus !== 'running'}>
            <Pause className="h-4 w-4" />
            <span className="sr-only">Pause</span>
          </Button>
          <Button variant="outline" size="icon" onClick={onStep} disabled={simStatus === 'running'}>
            <StepForward className="h-4 w-4" />
            <span className="sr-only">Step Forward</span>
          </Button>
          <Button variant="outline" size="icon" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
