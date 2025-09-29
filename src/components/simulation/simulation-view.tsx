'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeControl } from '@/components/simulation/time-control';
import { KPIPanel } from '@/components/simulation/kpi-panel';
import { Section, Simulation } from '@/lib/schema';

const MapComponent = dynamic(
  () => import('@/components/simulation/map-component').then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />,
  }
);

export function SimulationView({ section, simulation }: { section: Section, simulation: Simulation }) {
  return (
    <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <TimeControl simStatus={simulation.status} />
        <KPIPanel metrics={simulation.metrics} />
      </div>
      <div className="flex-1 min-h-[300px] md:min-h-0">
        <MapComponent section={section} />
      </div>
    </div>
  );
}
