import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, AlertTriangle, Gauge, Timer, Percent, Users, ShieldCheck, Zap, ArrowRightLeft, Clock
} from 'lucide-react';
import type { SimulationMetrics } from '@/hooks/use-simulation';
import { useSimulation } from '@/hooks/use-simulation';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';

const kpiConfig = [
  { key: 'throughput', label: 'Section Throughput', unit: 'trains/hr', icon: <BarChart /> },
  { key: 'avgDelay', label: 'Average Delay', unit: 'min', icon: <Timer /> },
  { key: 'totalDelay', label: 'Total Delay', unit: 'min', icon: <Clock /> },
  { key: 'punctualityRate', label: 'Punctuality Rate', unit: '%', icon: <Users />, isPercentage: true },
  { key: 'trackUtilization', label: 'Track Utilization', unit: '%', icon: <ArrowRightLeft />, isPercentage: true },
  { key: 'platformOccupancy', label: 'Platform Occupancy', unit: '%', icon: <Percent />, isPercentage: true },
  { key: 'conflictResolutionTime', label: 'Conflict Resolution', unit: 'min', icon: <AlertTriangle /> },
  { key: 'safetyComplianceRate', label: 'Safety Compliance', unit: '%', icon: <ShieldCheck />, isPercentage: true },
  { key: 'priorityAdherence', label: 'Priority Adherence', unit: '%', icon: <Gauge />, isPercentage: true },
];

export function KPIPanel({ caseId }: { caseId: string }) {
  const { metrics } = useSimulation(caseId);

  const getMetricColor = (key: keyof SimulationMetrics, value: number) => {
    switch(key) {
      case 'avgDelay':
      case 'totalDelay':
      case 'conflictResolutionTime':
        return value > 10 ? 'text-red-400' : value > 5 ? 'text-yellow-400' : 'text-green-400';
      case 'punctualityRate':
      case 'safetyComplianceRate':
      case 'priorityAdherence':
        return value < 80 ? 'text-red-400' : value < 95 ? 'text-yellow-400' : 'text-green-400';
      case 'trackUtilization':
      case 'platformOccupancy':
        return value > 90 ? 'text-red-400' : value > 70 ? 'text-yellow-400' : 'text-green-400';
      default:
        return 'text-foreground';
    }
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Live KPIs</CardTitle>
        <CardDescription>Real-time performance metrics for the simulation.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4 -mr-4">
            <div className="space-y-4">
            {kpiConfig.map(({ key, label, unit, icon, isPercentage }) => {
                const value = metrics[key as keyof SimulationMetrics] ?? 0;
                const color = getMetricColor(key as keyof SimulationMetrics, value);

                return (
                <div key={key} className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-md text-primary">{icon}</div>
                    <div className='flex-1'>
                        <div className='flex justify-between items-baseline'>
                            <p className="text-sm font-medium text-muted-foreground">{label}</p>
                            <p className={`text-xl font-bold ${color}`}>
                                {value.toFixed(isPercentage ? 0 : 1)}
                                <span className='text-xs text-muted-foreground ml-1'>{unit}</span>
                            </p>
                        </div>
                        {isPercentage && <Progress value={value} className='h-2 mt-1' indicatorClassName={
                          value < 80 ? 'bg-red-500' : value < 95 ? 'bg-yellow-500' : 'bg-green-500'
                        } />}
                    </div>
                </div>
                );
            })}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
