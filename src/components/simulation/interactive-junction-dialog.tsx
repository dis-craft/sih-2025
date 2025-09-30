'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ApprovalRequest } from '@/hooks/use-simulation';
import { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import React from 'react';

export function InteractiveJunctionDialog({
  isOpen,
  request,
  onDecision,
}: {
  isOpen: boolean;
  request: ApprovalRequest;
  onDecision: (trainId: string, approved: boolean, path?: string[]) => void;
}) {
  const [selectedPath, setSelectedPath] = useState<string[] | undefined>(
    request.possiblePaths[0]
  );

  const trainId = request.trainId;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
             {request.decisionPointId === 'start_approval' 
                ? `Train ${trainId} Ready for Departure`
                : `Train ${trainId} at Trigger Point`
              }
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
                {request.decisionPointId === 'start_approval'
                ? 'Approve to dispatch the train onto its scheduled path.'
                : 'Please confirm the path for the train to proceed.'}
            </p>
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
        </div>
        <AlertDialogFooter>
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
