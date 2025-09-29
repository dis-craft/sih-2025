'use client'

import { useState } from 'react';
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


const statusVariantMap: { [key in Request['status']]: 'secondary' | 'default' | 'destructive' } = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    modified: 'secondary',
    held: 'secondary',
};

export function RequestQueue({ sectionId }: { sectionId: string }) {
    const { toast } = useToast();
    const [requests, setRequests] = useState(Object.values(allRequests).filter(r => r.sectionId === sectionId));

    const handleDecision = (reqId: string, decision: 'approved' | 'rejected' | 'held') => {
        setRequests(prev => prev.map(r => r.id === reqId ? {...r, status: decision} : r));
        toast({
            title: `Request ${decision}`,
            description: `Request ${reqId} has been ${decision}.`,
        });
    }

    const pendingRequests = requests.filter(r => r.status === 'pending').sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

    return (
        <>
            <CardHeader className='pb-2'>
                <CardTitle className='text-md'>Incoming Queue</CardTitle>
                <CardDescription className='text-xs'>
                    Review and approve train entry requests.
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1 p-0'>
                <ScrollArea className='h-full'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='h-10'>Train</TableHead>
                                <TableHead className='h-10'>Type</TableHead>
                                <TableHead className='h-10 text-right'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingRequests.map(request => (
                                <TableRow key={request.id}>
                                    <TableCell className='py-2'>
                                        <div className='font-medium'>{allTrains[request.trainId].trainNo}</div>
                                        <div className='text-xs text-muted-foreground'>{request.id}</div>
                                    </TableCell>
                                    <TableCell className='capitalize py-2'>
                                        {request.requestType.replace('_', ' ')}
                                        {request.priority === 0 && (
                                            <Badge variant="destructive" className='ml-2 text-xs'>
                                                <AlertTriangle className='w-3 h-3 mr-1'/>
                                                Emergency
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right py-1">
                                        <TooltipProvider>
                                            <div className='flex gap-0.5 justify-end'>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:text-green-400" onClick={() => handleDecision(request.id, 'approved')}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Approve</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:text-yellow-400" onClick={() => handleDecision(request.id, 'held')}>
                                                            <Hand className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Hold</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400" onClick={() => handleDecision(request.id, 'rejected')}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Reject</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {pendingRequests.length === 0 && (
                        <p className="text-sm text-center py-8 text-muted-foreground">No pending requests.</p>
                    )}
                </ScrollArea>
            </CardContent>
        </>
    );
}
