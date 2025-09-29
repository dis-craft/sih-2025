
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Zap, Network, AlertTriangle } from 'lucide-react';

const messages = [
    { type: 'info', text: 'Monitoring network traffic...', icon: <Bot /> },
    { type: 'info', text: 'Analyzing section SBC-MYS for congestion.', icon: <Network /> },
    { type: 'optimization', text: 'Calculating optimal path for T16216.', icon: <Zap /> },
    { type: 'conflict', text: 'Potential conflict detected: T12613 and F5678 on approach.', icon: <AlertTriangle /> },
    { type: 'info', text: 'MILP solver running for Case 7...', icon: <Bot /> },
    { type: 'optimization', text: 'Rerouting T16216 to Platform 2 to maintain headway.', icon: <Zap /> },
    { type: 'info', text: 'Weather factor 0.9 applied to all train speeds.', icon: <Network /> },
    { type: 'conflict', text: 'High-priority train T12613 approaching. F5678 must yield.', icon: <AlertTriangle /> },
];

const getMessageStyle = (type: string) => {
    switch (type) {
        case 'optimization':
            return 'text-blue-400 border-blue-400/50';
        case 'conflict':
            return 'text-yellow-400 border-yellow-400/50';
        default:
            return 'text-muted-foreground border-border';
    }
}

export function AICopilot() {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 5000); // Change message every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const currentMessage = messages[currentMessageIndex];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot />
                    AI Copilot
                </CardTitle>
                <CardDescription>Live analysis and optimization feed.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className={`flex items-center gap-3 p-3 rounded-md border-l-4 transition-all duration-500 ${getMessageStyle(currentMessage.type)}`}>
                    <div className="flex-shrink-0">{currentMessage.icon}</div>
                    <p className="text-sm font-medium">{currentMessage.text}</p>
                </div>
            </CardContent>
        </Card>
    )
}
