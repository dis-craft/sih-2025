import { Clock, CheckCircle, AlertTriangle, ChevronsRight } from 'lucide-react';
import { liveStatuses, LiveStatus } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const statusInfo = {
  'On Time': {
    icon: CheckCircle,
    color: 'bg-green-500',
    text: 'text-green-500',
  },
  Delayed: {
    icon: Clock,
    color: 'bg-orange-500',
    text: 'text-orange-500',
  },
  Arrived: {
    icon: CheckCircle,
    color: 'bg-blue-500',
    text: 'text-blue-500',
  },
  Departed: {
    icon: ChevronsRight,
    color: 'bg-gray-500',
    text: 'text-gray-500',
  },
};

export function LiveStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Train Status</CardTitle>
        <CardDescription>Real-time updates on active trains.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {liveStatuses.map((train) => {
            const info = statusInfo[train.status] || { icon: AlertTriangle, color: 'bg-red-500', text: 'text-red-500' };
            return (
              <div key={train.id} className="flex items-start gap-4">
                <div className="mt-1 flex h-2 w-2 items-center justify-center rounded-full">
                  <span
                    className={cn(
                      'block h-2 w-2 rounded-full',
                      info.color,
                      train.status === 'On Time' && 'animate-pulse'
                    )}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{train.trainName}</p>
                    <Badge variant={train.status === 'Delayed' ? 'destructive' : 'secondary'}>
                      {train.status}
                      {train.delayMinutes && ` ${train.delayMinutes}min`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {train.currentLocation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
