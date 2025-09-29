import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuditEvent } from '@/lib/schema';
import { formatDistanceToNow } from 'date-fns';

export function EventLog({ events }: { events: AuditEvent[] }) {
  return (
    <Card className='flex-1 flex flex-col'>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>Log of all system and controller events.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="h-64">
            <div className='space-y-4 pr-4'>
            {events.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(event => (
                <div key={event.id} className="flex items-start gap-3">
                    <div className="text-xs text-muted-foreground w-20 shrink-0 text-right">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </div>
                    <div className='pl-3 border-l-2 border-border flex-1'>
                        <p className="text-sm font-medium capitalize">{event.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{event.details.reason || `Decision: ${event.details.decision}`}</p>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
