import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, AlertTriangle } from 'lucide-react';
import { Simulation } from '@/lib/schema';

export function KPIPanel({ metrics }: { metrics: Simulation['metrics'] }) {
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Live KPIs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-md">
                <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.throughput}</div>
              <p className="text-xs text-muted-foreground">Throughput/hr</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-md">
                <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold">{metrics.avgDelay}min</div>
              <p className="text-xs text-muted-foreground">Avg. Delay</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
