
import React from 'react';
import { ReconData } from '../types/reconTypes';
import { formatDate, getDurationInMinutes } from '../utils/dateUtils';
import { Shield, Server, User, Clock, AlertTriangle, CheckCircle2, ChartPie } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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
  
  // Prepare data for charts
  const commandStatusData = [
    { name: 'Successful', value: successfulCommands, color: '#10b981' },
    { name: 'Failed', value: failedCommands, color: '#ef4444' },
  ];

  // Calculate tactics distribution
  const tacticsData = Object.values(data.steps).reduce((acc: {name: string, value: number, color: string}[], hostSteps) => {
    hostSteps.steps.forEach(step => {
      const tactic = step.attack.tactic;
      const existingTactic = acc.find(t => t.name === tactic);
      
      if (existingTactic) {
        existingTactic.value++;
      } else {
        const colors = ['#8b5cf6', '#ec4899', '#f97316', '#0ea5e9', '#10b981', '#facc15', '#6366f1'];
        acc.push({
          name: tactic,
          value: 1,
          color: colors[acc.length % colors.length],
        });
      }
    });
    return acc;
  }, []);

  // Platform distribution data
  const platformData = data.host_group.reduce((acc: {name: string, value: number, color: string}[], host) => {
    const platform = host.platform;
    const existingPlatform = acc.find(p => p.name === platform);
    
    if (existingPlatform) {
      existingPlatform.value++;
    } else {
      const colors = ['#60a5fa', '#f472b6', '#fbbf24'];
      acc.push({
        name: platform,
        value: 1,
        color: colors[acc.length % colors.length],
      });
    }
    return acc;
  }, []);

  // Commands per host
  const commandsPerHost = Object.entries(data.steps).map(([paw, hostSteps]) => {
    const hostname = data.host_group.find(h => h.paw === paw)?.host || paw;
    return {
      name: hostname,
      total: hostSteps.steps.length,
      successful: hostSteps.steps.filter(step => step.status === 0).length,
      failed: hostSteps.steps.filter(step => step.status !== 0).length,
    };
  });

  // Chart config for recharts
  const chartConfig = {
    success: {
      color: '#10b981',
      theme: { light: '#10b981', dark: '#059669' },
      label: 'Successful'
    },
    failed: {
      color: '#ef4444',
      theme: { light: '#ef4444', dark: '#dc2626' },
      label: 'Failed'
    },
    total: {
      color: '#6366f1',
      theme: { light: '#6366f1', dark: '#4f46e5' },
      label: 'Total'
    },
  };

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

      {/* Command Status Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-card rounded-lg border shadow p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <ChartPie className="h-5 w-5 mr-2 text-primary" />
            Command Execution Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={commandStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {commandStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border p-2 rounded shadow-lg">
                          <p className="font-medium">{payload[0].name}: {payload[0].value}</p>
                          <p className="text-sm text-muted-foreground">
                            {((payload[0].value / totalCommands) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution Pie Chart */}
        <div className="bg-card rounded-lg border shadow p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Server className="h-5 w-5 mr-2 text-primary" />
            Platform Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border p-2 rounded shadow-lg">
                          <p className="font-medium">{payload[0].name}</p>
                          <p className="text-sm text-muted-foreground">
                            {payload[0].value} host{payload[0].value > 1 ? 's' : ''}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Commands per Host Bar Chart */}
      <div className="mt-6 bg-card rounded-lg border shadow p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Server className="h-5 w-5 mr-2 text-primary" />
          Commands Per Host
        </h3>
        <div className="h-80">
          <ChartContainer 
            className="h-full"
            config={chartConfig}
          >
            <BarChart
              data={commandsPerHost}
              margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
            >
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent nameKey="name" />
                }
              />
              <Legend />
              <Bar dataKey="successful" name="Successful" fill="#10b981" stackId="a" />
              <Bar dataKey="failed" name="Failed" fill="#ef4444" stackId="a" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Tactics Distribution */}
      <div className="mt-6 bg-card rounded-lg border shadow p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <ChartPie className="h-5 w-5 mr-2 text-primary" />
          Tactics Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tacticsData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {tacticsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border p-2 rounded shadow-lg">
                        <p className="font-medium">{payload[0].name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload[0].value} command{payload[0].value > 1 ? 's' : ''}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
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
