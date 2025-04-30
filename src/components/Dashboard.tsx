import React from 'react';
import { ReconData } from '../types/reconTypes';
import { formatDate, getDurationInMinutes } from '../utils/dateUtils';
import { Shield, Server, User, Clock, AlertTriangle, CheckCircle2, ChartPie, Network } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import NetworkChart from './NetworkChart';

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

  // Prepare network chart data
  const networkNodes = [...data.host_group.map(host => ({
    id: host.paw,
    name: host.host || host.paw,
    platform: host.platform,
    value: Object.values(data.steps).find(step => step.steps.length > 0) ? 
      data.steps[host.paw]?.steps.length || 0 : 0
  }))];
  
  const networkLinks = [];
  for (const hostPaw in data.steps) {
    const hostNode = networkNodes.find(node => node.id === hostPaw);
    if (hostNode) {
      const steps = data.steps[hostPaw].steps;
      for (const step of steps) {
        const targetNode = {
          id: `${hostPaw}-${step.link_id}`,
          name: step.name,
          technique_id: step.attack.technique_id,
          status: step.status === 0 ? 'success' : 'failed',
          paw: hostPaw
        };
        networkNodes.push(targetNode);
        networkLinks.push({
          source: hostPaw,
          target: targetNode.id,
          value: 1
        });
      }
    }
  }

  // Format for visualization
  const networkData = {
    nodes: networkNodes,
    links: networkLinks
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded shadow-lg">
          <p className="font-medium">{payload[0].name}: {payload[0].value}</p>
          <p className="text-sm text-muted-foreground">
            {typeof payload[0].value === 'number' && totalCommands > 0 ? 
              `${((payload[0].value / totalCommands) * 100).toFixed(1)}% of total` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Chart config for recharts
  const chartConfig = {
    successful: {
      theme: { light: '#10b981', dark: '#059669' },
      label: 'Successful'
    },
    failed: {
      theme: { light: '#ef4444', dark: '#dc2626' },
      label: 'Failed'
    },
    total: {
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

      {/* First Row of Charts - Status and Platform */}
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
                  label={renderCustomizedLabel}
                >
                  {commandStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
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
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row of Charts - Commands per Host and Tactics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Commands per Host Bar Chart */}
        <div className="bg-card rounded-lg border shadow p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Server className="h-5 w-5 mr-2 text-primary" />
            Commands Per Host
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip />
                <Legend />
                <Bar dataKey="successful" name="Successful" fill="#10b981" stackId="a" />
                <Bar dataKey="failed" name="Failed" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tactics Distribution */}
        <div className="bg-card rounded-lg border shadow p-4">
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
                  label={renderCustomizedLabel}
                >
                  {tacticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Network Chart */}
      <div className="mt-6 bg-card rounded-lg border shadow p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Network className="h-5 w-5 mr-2 text-primary" />
          Command Execution Network
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          Visualization of commands executed across hosts
        </p>
        <div className="h-96 w-full">
          <NetworkChart data={networkData} />
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
