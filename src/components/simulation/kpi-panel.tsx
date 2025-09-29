import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, AlertTriangle, Gauge } from 'lucide-react';
import type { SimulationMetrics } from '@/hooks/use-simulation';

export function KPIPanel({ metrics }: { metrics: SimulationMetrics }) {
  const efficiency = metrics.efficiency ?? 0;
  const efficiencyColor = efficiency > 0.8 ? 'text-green-400' : efficiency > 0.6 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Live KPIs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-full">
                <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.throughput}</div>
              <p className="text-xs text-muted-foreground">Throughput/hr</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.avgDelay.toFixed(1)}<span className="text-sm text-muted-foreground">min</span></div>
              <p className="text-xs text-muted-foreground">Avg. Delay</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-muted rounded-full">
                <Gauge className={`h-5 w-5 ${efficiencyColor}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${efficiencyColor}`}>{(efficiency * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">Efficiency</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
