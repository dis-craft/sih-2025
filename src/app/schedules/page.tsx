'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { trainSchedules, TrainSchedule } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusVariantMap: { [key in TrainSchedule['status']]: 'default' | 'destructive' | 'outline' } = {
  'On Time': 'default',
  'Delayed': 'destructive',
  'Cancelled': 'outline',
};

const statusColorMap: { [key in TrainSchedule['status']]: string } = {
  'On Time': 'bg-green-500',
  'Delayed': 'bg-orange-500',
  'Cancelled': 'bg-gray-500',
};


export default function SchedulesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchedules = trainSchedules.filter(
    (schedule) =>
      schedule.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header title="Train Schedules" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="bg-card rounded-lg shadow-sm">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search schedules by name, destination, or ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Train ID</TableHead>
                        <TableHead>Train Name</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead className="text-right">Departure</TableHead>
                        <TableHead className="text-right">Arrival</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className={cn("h-2.5 w-2.5 rounded-full", statusColorMap[schedule.status])} />
                                <span className="hidden sm:inline">{schedule.status}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-mono">{schedule.id}</TableCell>
                        <TableCell className="font-medium">{schedule.trainName}</TableCell>
                        <TableCell>{schedule.origin}</TableCell>
                        <TableCell>{schedule.destination}</TableCell>
                        <TableCell className="text-right">{schedule.departureTime}</TableCell>
                        <TableCell className="text-right">{schedule.arrivalTime}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
             {filteredSchedules.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No schedules found for your search.
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
