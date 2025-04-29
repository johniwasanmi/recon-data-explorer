
import React from 'react';
import { Steps } from '../types/reconTypes';
import { formatDate } from '../utils/dateUtils';
import { CheckCircle, XCircle, Clock, Server } from 'lucide-react';

interface TimelineProps {
  steps: Steps;
  startTime: string;
  endTime: string;
}

const Timeline: React.FC<TimelineProps> = ({ steps, startTime, endTime }) => {
  // Combine all steps into a single array and sort by time
  const allEvents: Array<{ 
    time: string; 
    type: string; 
    host: string;
    paw: string;
    description?: string;
    name?: string;
    status?: number;
    command?: string;
  }> = [
    {
      time: startTime,
      type: 'operation',
      host: 'System',
      paw: 'system',
      description: 'Operation started'
    }
  ];

  // Add command execution events
  Object.entries(steps).forEach(([paw, hostSteps]) => {
    hostSteps.steps.forEach(step => {
      allEvents.push({
        time: step.run,
        type: 'command',
        host: step.platform,
        paw: paw,
        description: step.description,
        name: step.name,
        status: step.status,
        command: step.plaintext_command
      });
    });
  });

  // Add operation end event
  allEvents.push({
    time: endTime,
    type: 'operation',
    host: 'System',
    paw: 'system',
    description: 'Operation completed'
  });

  // Sort events by time
  allEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Clock className="mr-2 h-6 w-6 text-primary" />
        Operation Timeline
      </h2>
      
      <div className="bg-card rounded-lg border shadow">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Chronological View</h3>
        </div>
        
        <div className="p-4">
          <ul className="space-y-6">
            {allEvents.map((event, index) => (
              <li 
                key={`${event.time}-${index}`} 
                className="relative pl-8 timeline-item animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8">
                  {event.type === 'operation' ? (
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-success' : 'bg-info'}`}></div>
                  ) : (
                    event.status === 0 ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-danger" />
                    )
                  )}
                </div>
                
                <div>
                  <time className="block text-xs text-muted-foreground mb-1">
                    {formatDate(event.time)}
                  </time>
                  
                  <div className="flex items-center mb-1">
                    <Server className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-primary font-medium">
                      {event.host}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium">
                    {event.type === 'operation' ? event.description : event.name}
                  </p>
                  
                  {event.command && (
                    <div className="mt-1 terminal-code text-xs py-2">
                      <code className="command">{event.command}</code>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
