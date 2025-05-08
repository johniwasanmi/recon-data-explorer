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
  
  // Prepare data for charts with improved color schemes
  const commandStatusData = [
    { name: 'Successful', value: successfulCommands, color: '#10b981' },
    { name: 'Failed', value: failedCommands, color: '#ef4444' },
  ];

  // Calculate tactics distribution with enhanced colors
  const tacticsColors = [
    '#8b5cf6', '#ec4899', '#f97316', '#0ea5e9', '#10b981', 
    '#facc15', '#6366f1', '#14b8a6', '#f43f5e', '#84cc16',
    '#8b5cf6', '#ec4899'
  ];
  
  const tacticsData = Object.values(data.steps).reduce((acc: {name: string, value: number, color: string}[], hostSteps) => {
    hostSteps.steps.forEach(step => {
      const tactic = step.attack.tactic;
      const existingTactic = acc.find(t => t.name === tactic);
      
      if (existingTactic) {
        existingTactic.value++;
      } else {
        acc.push({
          name: tactic,
          value: 1,
          color: tacticsColors[acc.length % tacticsColors.length],
        });
      }
    });
    return acc;
  }, []);

  // Platform distribution data with enhanced colors
  const platformColors = {
    'windows': '#60a5fa',
    'linux': '#f472b6',
    'darwin': '#fbbf24'
  };
  
  const platformData = data.host_group.reduce((acc: {name: string, value: number, color: string}[], host) => {
    const platform = host.platform;
    const existingPlatform = acc.find(p => p.name === platform);
    
    if (existingPlatform) {
      existingPlatform.value++;
    } else {
      const color = platformColors[platform as keyof typeof platformColors] || '#6366f1';
      acc.push({
        name: platform,
        value: 1,
        color: color,
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
  const prepareNetworkData = () => {
    // Create a map for quick node lookup
    const nodeMap = new Map();
    
    // Create host nodes first
    const nodes = data.host_group.map(host => {
      const node = {
        id: host.paw,
        name: host.host || host.paw,
        platform: host.platform,
        value: data.steps[host.paw]?.steps.length || 0,
        // Adding these properties for TypeScript
        x: undefined,
        y: undefined,
        fx: null as number | null,
        fy: null as number | null
      };
      
      nodeMap.set(host.paw, node);
      return node;
    });
    
    const links: any[] = [];
    
    // Create command nodes and links
    Object.entries(data.steps).forEach(([hostPaw, hostData]) => {
      hostData.steps.forEach((step, index) => {
        // Create unique ID for the command node
        const commandId = `${hostPaw}-${step.link_id}`;
        
        // Create command node
        const commandNode = {
          id: commandId,
          name: step.name,
          technique_id: step.attack.technique_id,
          status: step.status === 0 ? 'success' : 'failed',
          paw: hostPaw,
          value: 0,
          platform: undefined,
          x: undefined,
          y: undefined,
          fx: null as number | null,
          fy: null as number | null
        };
        
        // Add command node
        nodes.push(commandNode);
        nodeMap.set(commandId, commandNode);
        
        // Add link from host to command
        links.push({
          source: hostPaw,
          target: commandId,
          value: 1
        });
      });
    });
    
    return { nodes, links };
  };

  const networkData = prepareNetworkData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border p-3 rounded shadow-lg backdrop-blur-sm">
          <p className="font-medium text-sm">{payload[0].name}: {payload[0].value}</p>
          <p className="text-xs text-muted-foreground">
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
        fontSize="12"
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
        <div className="stat-card animate-fade-in bg-gradient-to-br from-card to-card/90">
          <div className="flex items-center text-primary">
            <Server className="mr-2 h-5 w-5" />
            <span className="stat-label">Total Hosts</span>
          </div>
          <span className="stat-value">{totalHosts}</span>
        </div>
        
        <div className="stat-card animate-fade-in bg-gradient-to-br from-card to-card/90" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center text-primary">
            <User className="mr-2 h-5 w-5" />
            <span className="stat-label">Total Commands</span>
          </div>
          <span className="stat-value">{totalCommands}</span>
        </div>
        
        <div className="stat-card animate-fade-in bg-gradient-to-br from-card to-card/90" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center text-success">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            <span className="stat-label">Successful Commands</span>
          </div>
          <span className="stat-value">{successfulCommands}</span>
        </div>
        
        <div className="stat-card animate-fade-in bg-gradient-to-br from-card to-card/90" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center text-danger">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span className="stat-label">Failed Commands</span>
          </div>
          <span className="stat-value">{failedCommands}</span>
        </div>
      </div>

      {/* First Row of Charts - Status and Platform */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gradient-to-br from-card to-card/90 rounded-lg border shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <ChartPie className="h-5 w-5 mr-2 text-primary" />
            Command Execution Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {commandStatusData.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.color} />
                      <stop offset="100%" stopColor={`${entry.color}99`} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={commandStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  animationBegin={200}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {commandStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient${index})`} 
                      stroke={entry.color} 
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution Pie Chart */}
        <div className="bg-gradient-to-br from-card to-card/90 rounded-lg border shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Server className="h-5 w-5 mr-2 text-primary" />
            Platform Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {platformData.map((entry, index) => (
                    <linearGradient key={`platform-gradient-${index}`} id={`platformGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.color} />
                      <stop offset="100%" stopColor={`${entry.color}99`} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  animationBegin={200}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {platformData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#platformGradient${index})`}
                      stroke={entry.color}
                      strokeWidth={1}
                    />
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
        <div className="bg-gradient-to-br from-card to-card/90 rounded-lg border shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Server className="h-5 w-5 mr-2 text-primary" />
            Commands Per Host
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={commandsPerHost}
                margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
                barSize={20}
                barGap={2}
                barCategoryGap="20%"
              >
                <defs>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderRadius: '0.375rem',
                    border: '1px solid #475569',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  wrapperStyle={{ paddingBottom: '10px' }} 
                />
                <Bar 
                  dataKey="successful" 
                  name="Successful" 
                  fill="url(#successGradient)" 
                  stackId="a" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={300}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
                <Bar 
                  dataKey="failed" 
                  name="Failed" 
                  fill="url(#failedGradient)" 
                  stackId="a" 
                  radius={[0, 0, 4, 4]}
                  animationBegin={300}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tactics Distribution */}
        <div className="bg-gradient-to-br from-card to-card/90 rounded-lg border shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <ChartPie className="h-5 w-5 mr-2 text-primary" />
            Tactics Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {tacticsData.map((entry, index) => (
                    <linearGradient key={`tactics-gradient-${index}`} id={`tacticsGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={entry.color} />
                      <stop offset="100%" stopColor={`${entry.color}99`} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={tacticsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                  animationBegin={200}
                  animationDuration={1400}
                  animationEasing="ease-out"
                >
                  {tacticsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#tacticsGradient${index})`} 
                      stroke={entry.color}
                      strokeWidth={1}
                    />
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
      <div className="mt-6 bg-gradient-to-br from-card to-card/90 rounded-lg border shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Network className="h-5 w-5 mr-2 text-primary" />
          Command Execution Network
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          Interactive visualization of commands executed across hosts. Drag nodes to explore connections, zoom with buttons or mouse wheel.
        </p>
        <div className="h-[500px] w-full">
          <NetworkChart data={networkData} />
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-br from-card to-card/90 rounded-lg border shadow-md animate-fade-in hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: '400ms' }}>
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
