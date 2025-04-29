
import React from 'react';
import { ReconData } from '../types/reconTypes';
import { formatDate, getDurationInMinutes } from '../utils/dateUtils';
import { Shield, Server, User, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  data: ReconData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Calculate stats
  const totalHosts = data.host_group.length;
  const totalCommands = Object.values(data.steps).reduce(
    (acc, hostSteps) => acc + hostSteps.steps.length,
    0
  );
  const successfulCommands = Object.values(data.steps).reduce(
    (acc, hostSteps) => acc + hostSteps.steps.filter(step => step.status === 0).length,
    0
  );
  const failedCommands = totalCommands - successfulCommands;
  const operationDuration = getDurationInMinutes(data.start, data.finish);
  
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Shield className="mr-2 h-6 w-6 text-primary" />
          Operation Summary: {data.name}
        </h2>
        <p className="text-muted-foreground">
          Started: {formatDate(data.start)} • Finished: {formatDate(data.finish)} • 
          Duration: {operationDuration} minutes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card animate-fade-in">
          <div className="flex items-center text-primary">
            <Server className="mr-2 h-5 w-5" />
            <span className="stat-label">Total Hosts</span>
          </div>
          <span className="stat-value">{totalHosts}</span>
        </div>
        
        <div className="stat-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center text-primary">
            <User className="mr-2 h-5 w-5" />
            <span className="stat-label">Total Commands</span>
          </div>
          <span className="stat-value">{totalCommands}</span>
        </div>
        
        <div className="stat-card animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center text-success">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            <span className="stat-label">Successful Commands</span>
          </div>
          <span className="stat-value">{successfulCommands}</span>
        </div>
        
        <div className="stat-card animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center text-danger">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span className="stat-label">Failed Commands</span>
          </div>
          <span className="stat-value">{failedCommands}</span>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-card rounded-lg border shadow animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center mb-2">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Operation Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Planner</p>
            <p className="font-medium">{data.planner}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Adversary</p>
            <p className="font-medium">{data.adversary.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jitter</p>
            <p className="font-medium">{data.jitter}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{data.adversary.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
