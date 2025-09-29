'use client';

import { TimeControl } from '@/components/simulation/time-control';
import { KPIPanel } from '@/components/simulation/kpi-panel';
import { Section, Simulation } from '@/lib/schema';
import { MapComponent } from './map-component';
import { useSimulation } from '@/hooks/use-simulation';

export function SimulationView({ section, simulation }: { section: Section, simulation: Simulation }) {
  const sim = useSimulation();

  return (
    <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <TimeControl 
          simStatus={sim.isRunning ? 'running' : 'paused'} 
          onPlay={() => sim.setIsRunning(true)}
          onPause={() => sim.setIsRunning(false)}
          onReset={sim.reset}
          onStep={sim.step}
        />
        <KPIPanel metrics={simulation.metrics} />
      </div>
      <div className="flex-1 min-h-[300px] md:min-h-0">
        <MapComponent section={section} />
      </div>
    </div>
  );
}
