
'use client'

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requests as allRequests, allTrains } from '@/lib/data';
import { Request } from '@/lib/schema';
import { Check, X, Hand, AlertTriangle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { SidebarGroup, SidebarGroupLabel } from '../ui/sidebar';

export function ControlPanel({ sectionId }: { sectionId: string }) {
    const { toast } = useToast();
    const [requests, setRequests] = useState(Object.values(allRequests).filter(r => r.sectionId === sectionId && r.status === 'pending'));
    const [visibleRequests, setVisibleRequests] = useState<Request[]>([]);

    useEffect(() => {
        const initialRequests = Object.values(allRequests).filter(r => r.sectionId === sectionId && r.status === 'pending');
        setRequests(initialRequests);
        setVisibleRequests([]);

        if (initialRequests.length > 0) {
            let index = 0;
            const interval = setInterval(() => {
                setVisibleRequests(prev => [...prev, initialRequests[index]]);
                index++;
                if (index >= initialRequests.length) {
                    clearInterval(interval);
                }
            }, 3000); // New request every 3 seconds

            return () => clearInterval(interval);
        }
    }, [sectionId]);


    const handleDecision = (reqId: string, decision: 'approved' | 'rejected') => {
        setVisibleRequests(prev => prev.filter(r => r.id !== reqId));
        toast({
            title: `Request ${decision}`,
            description: `Request for ${allTrains[requests.find(r=>r.id === reqId)!.trainId].trainNo} has been ${decision}.`,
        });
    }

    const pendingRequests = visibleRequests.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

    return (
        <SidebarGroup>
            <SidebarGroupLabel className='px-4'>Control Panel</SidebarGroupLabel>
            <div className='px-2 py-1 text-xs text-muted-foreground'>
                Review and approve train entry requests.
            </div>
            <div className='p-2 max-h-64'>
                <ScrollArea className='h-full'>
                    <div className='space-y-2 pr-2'>
                    {pendingRequests.map(request => (
                        <Card key={request.id} className='bg-card'>
                            <CardHeader className='p-3 pb-2'>
                                <div className='flex justify-between items-start'>
                                    <div>
                                        <CardTitle className='text-sm'>{allTrains[request.trainId].trainNo}</CardTitle>
                                        <CardDescription className='text-xs'>
                                            {request.requestType.replace('_', ' ')}
                                        </CardDescription>
                                    </div>
                                    {request.priority === 0 && (
                                        <Badge variant="destructive" className='text-xs'>
                                            <AlertTriangle className='w-3 h-3 mr-1'/>
                                            Emergency
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className='p-3 pt-0'>
                                <div className='flex gap-2 justify-end'>
                                    <Button variant="outline" size="sm" className="h-7 text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-500" onClick={() => handleDecision(request.id, 'rejected')}>
                                        <X className="h-4 w-4 mr-1" />
                                        Decline
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-7 text-green-500 border-green-500/50 hover:bg-green-500/10 hover:text-green-500" onClick={() => handleDecision(request.id, 'approved')}>
                                        <Check className="h-4 w-4 mr-1" />
                                        Approve
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {pendingRequests.length === 0 && (
                         <div className="text-xs text-center py-4 text-muted-foreground">Waiting for requests...</div>
                    )}
                    </div>
                </ScrollArea>
            </div>
        </SidebarGroup>
    );
}

