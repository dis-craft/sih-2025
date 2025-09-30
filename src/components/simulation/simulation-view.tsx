'use client';

import { TimeControl } from '@/components/simulation/time-control';
import { KPIPanel } from '@/components/simulation/kpi-panel';
import { Section } from '@/lib/schema';
import { MapComponent } from './map-component';
import { useSimulation } from '@/hooks/use-simulation';
import { simulationCases } from '@/lib/simulation-cases';
import { notFound } from 'next/navigation';
import { Card } from '../ui/card';

export function SimulationView({ section, caseId }: { section: Section, caseId: string }) {
  const sim = useSimulation(caseId);
  
  const selectedCase = simulationCases[caseId];
  if (!selectedCase) {
    notFound();
  }

  return (
    <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
        <TimeControl 
          simStatus={sim.isRunning ? 'running' : 'paused'}
          simSpeed={sim.simulationSpeed} 
          onPlay={() => sim.setIsRunning(true)}
          onPause={() => sim.setIsRunning(false)}
          onReset={sim.reset}
          onStep={sim.step}
          onSpeedChange={sim.setSimulationSpeed}
        />
      <div className="flex-1 min-h-[300px] md:min-h-0 bg-card rounded-lg border">
        <MapComponent section={section} caseId={caseId} />
      </div>
    </div>
  );
}
