
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ApprovalRequest } from '@/hooks/use-simulation';
import { useState } from 'react';
import { ArrowRight, Check, X, Bot } from 'lucide-react';
import React from 'react';

export function ApprovalPanel({
  request,
  onDecision,
}: {
  request: ApprovalRequest;
  onDecision: (trainId: string, approved: boolean, path?: string[]) => void;
}) {
  const [selectedPath, setSelectedPath] = useState<string[] | undefined>(
    request.possiblePaths[0]
  );

  const trainId = request.trainId;

  return (
    <Card className="border-primary/50">
        <CardHeader className='pb-4'>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <Bot />
                Controller Action Required
            </CardTitle>
            <CardDescription>
                {request.decisionPointId === 'start_approval' 
                    ? `Train ${trainId} is ready for departure.`
                    : `Train ${trainId} at trigger point.`
                }
            </CardDescription>
        </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm">AI Suggested Route:</h4>
            <div className="flex flex-wrap gap-2 items-center p-3 rounded-md bg-muted">
              {selectedPath?.map((trackId, index) => (
                <React.Fragment key={`${trackId}-${index}`}>
                  <Badge variant="secondary">
                    {trackId}
                  </Badge>
                  {index < selectedPath.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
                variant="outline"
                onClick={() => onDecision(trainId, false)}
                className='border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-400'
            >
                <X className="mr-2 h-4 w-4" />
                Reject
            </Button>
            <Button
                onClick={() => onDecision(trainId, true, selectedPath)}
                className='bg-green-600 hover:bg-green-700 text-white'
            >
                <Check className="mr-2 h-4 w-4" />
                Approve
            </Button>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
