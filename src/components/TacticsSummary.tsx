
import React from 'react';
import { Steps } from '../types/reconTypes';
import { Shield, Target, AlertTriangle } from 'lucide-react';

interface TacticsSummaryProps {
  steps: Steps;
}

const TacticsSummary: React.FC<TacticsSummaryProps> = ({ steps }) => {
  // Count tactics and techniques
  const tactics: Record<string, number> = {};
  const techniques: Record<string, { name: string; count: number }> = {};
  
  Object.values(steps).forEach(hostSteps => {
    hostSteps.steps.forEach(step => {
      const { tactic, technique_id, technique_name } = step.attack;
      
      // Count tactics
      if (!tactics[tactic]) {
        tactics[tactic] = 0;
      }
      tactics[tactic] += 1;
      
      // Count techniques
      const techniqueKey = `${technique_id}-${tactic}`;
      if (!techniques[techniqueKey]) {
        techniques[techniqueKey] = { name: technique_name, count: 0 };
      }
      techniques[techniqueKey].count += 1;
    });
  });
  
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Target className="mr-2 h-6 w-6 text-primary" />
        ATT&CK Tactics & Techniques
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border shadow animate-fade-in">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold flex items-center">
              <Shield className="mr-2 h-5 w-5 text-attack-tactic" />
              Tactics Used
            </h3>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {Object.entries(tactics).map(([tactic, count]) => (
                <li key={tactic} className="flex items-center justify-between">
                  <span className="technique-badge bg-attack-tactic text-white capitalize">
                    {tactic}
                  </span>
                  <span className="text-sm font-medium">{count} {count === 1 ? 'execution' : 'executions'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border shadow animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-attack-technique" />
              Techniques Used
            </h3>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {Object.entries(techniques).map(([key, { name, count }]) => {
                const techniqueId = key.split('-')[0];
                return (
                  <li key={key} className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="technique-badge bg-attack-technique text-white">
                        {techniqueId}
                      </span>
                      <span className="text-sm font-medium">{count} {count === 1 ? 'use' : 'uses'}</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1">{name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticsSummary;
