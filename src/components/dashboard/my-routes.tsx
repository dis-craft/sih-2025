'use client';

import { Bell, BellOff, Route } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { savedRoutes, SavedRoute } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { sendPersonalizedAlert } from '@/ai/flows/personalized-alerts';

export function MyRoutesCard() {
  const { toast } = useToast();

  const handleAlertToggle = async (route: SavedRoute, enabled: boolean) => {
    // In a real app, you would update the user's preferences in the database.
    // For this demo, we'll just show a toast and simulate the AI call.
    
    toast({
      title: `Alerts ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `Notifications for ${route.origin} to ${route.destination} have been updated.`,
    });

    if(enabled) {
        try {
            // Simulate a delay alert
            const alertResult = await sendPersonalizedAlert({
                userId: 'user123',
                routeId: route.id,
                delayStatus: 'Delayed',
                estimatedDelayTime: '15 minutes'
            });
            console.log('AI Alert Sent:', alertResult.message);
            toast({
              title: "AI Alert Simulation",
              description: alertResult.message
            })
        } catch(e) {
            console.error(e)
        }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Routes & Alerts</CardTitle>
        <CardDescription>Manage your saved routes and notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savedRoutes.map((route) => (
            <div
              key={route.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Route className="size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {route.origin} to {route.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id={`alerts-${route.id}`}
                  defaultChecked={route.alertsEnabled}
                  onCheckedChange={(checked) => handleAlertToggle(route, checked)}
                  aria-label={`Toggle alerts for route from ${route.origin} to ${route.destination}`}
                />
                <Label htmlFor={`alerts-${route.id}`}>
                    {route.alertsEnabled ? <Bell className="size-4" /> : <BellOff className="size-4 text-muted-foreground"/>}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
