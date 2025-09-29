'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { predictDelay, PredictDelayOutput } from '@/ai/flows/delay-prediction';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  origin: z.string().min(2, 'Required'),
  destination: z.string().min(2, 'Required'),
  departureTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time (HH:MM)'),
});

export function DelayPredictionCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictDelayOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: 'Central Station',
      destination: 'Northwood',
      departureTime: '08:00',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const prediction = await predictDelay(values);
      setResult(prediction);
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get delay prediction. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <BrainCircuit className="size-6 text-primary" />
          <div>
            <CardTitle>AI Delay Prediction</CardTitle>
            <CardDescription>
              Predict potential delays and get alternative routes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Central Station" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Northwood" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departureTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure (24h)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 14:30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <Sparkles className="mr-2" />
              )}
              Predict Delay
            </Button>
          </form>
        </Form>
      </CardContent>
      {result && (
        <>
          <Separator className="my-4"/>
          <CardFooter className="flex flex-col items-start gap-4">
            <h3 className="font-semibold text-foreground">Prediction Results:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-sm">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-muted-foreground">Predicted Delay</p>
                    <p className="text-xl font-bold text-primary">{result.delayPrediction}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-muted-foreground">Confidence Level</p>
                    <p className="text-xl font-bold text-accent">{result.confidenceLevel}</p>
                </div>
                <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
                    <p className="font-medium text-muted-foreground">Alternative Routes</p>
                    <p className="text-foreground">{result.alternativeRoutes}</p>
                </div>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
