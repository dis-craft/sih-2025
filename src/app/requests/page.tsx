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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { locoRequests, LocoRequest } from '@/lib/data';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

const statusVariantMap: { [key in LocoRequest['status']]: 'default' | 'destructive' | 'secondary' } = {
    'Pending': 'secondary',
    'Approved': 'default',
    'Denied': 'destructive',
  };

export default function RequestsPage() {
    const [requests, setRequests] = useState<LocoRequest[]>(locoRequests);
    const { toast } = useToast();

    const handleResponse = (id: string, status: 'Approved' | 'Denied') => {
        setRequests(requests.map(req => req.id === id ? {...req, status} : req));
        toast({
            title: `Request ${status}`,
            description: `Request ${id} has been marked as ${status}.`
        })
    }

    const handleNewRequest = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newRequest: LocoRequest = {
            id: `REQ${String(requests.length + 1).padStart(3, '0')}`,
            pilot: 'Current User', // Placeholder
            trainId: formData.get('trainId') as string,
            requestType: formData.get('requestType') as LocoRequest['requestType'],
            message: formData.get('message') as string,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'Pending',
        };
        setRequests([newRequest, ...requests]);
        toast({
            title: 'Request Sent',
            description: 'Your request has been submitted to the Sectional Controller.',
        });
        (e.target as HTMLFormElement).reset();
    }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header title="Loco Pilot Request System" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Tabs defaultValue="view">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="view">View Requests</TabsTrigger>
            <TabsTrigger value="create">Create Request</TabsTrigger>
          </TabsList>
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Requests</CardTitle>
                <CardDescription>
                  View and respond to requests from loco pilots.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Train ID</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono">{request.trainId}</TableCell>
                        <TableCell>{request.requestType}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.message}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariantMap[request.status]}>{request.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {request.status === 'Pending' && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" onClick={() => handleResponse(request.id, 'Approved')}>Approve</Button>
                                    <Button size="sm" variant="outline" onClick={() => handleResponse(request.id, 'Denied')}>Deny</Button>
                                </div>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Create a New Request</CardTitle>
                <CardDescription>
                  Send a request to the Sectional Controller for assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewRequest} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="trainId">Train ID</Label>
                            <Input id="trainId" name="trainId" placeholder="e.g., TRN101" required />
                        </div>
                        <div>
                            <Label htmlFor="requestType">Request Type</Label>
                            <Select name="requestType" required>
                            <SelectTrigger id="requestType">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Track Clearance">Track Clearance</SelectItem>
                                <SelectItem value="Rerouting">Rerouting</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Emergency">Emergency</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                    </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" placeholder="Describe your request in detail..." required />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2" />
                    Send Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
