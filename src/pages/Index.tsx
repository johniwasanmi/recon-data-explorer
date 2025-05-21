
import React, { useState } from 'react';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import HostCard from '../components/HostCard';
import CommandsList from '../components/CommandsList';
import TacticsSummary from '../components/TacticsSummary';
import Timeline from '../components/Timeline';
import FileUpload from '../components/FileUpload';
import ExportPDF from '../components/ExportPDF';
import { sampleReconData } from '../data/sampleData';
import { ReconData } from '../types/reconTypes';
import { Server } from 'lucide-react';

const Index = () => {
  // Initialize with sample data, properly typed
  const [data, setData] = useState<ReconData>(sampleReconData);

  const handleDataUpload = (newData: ReconData) => {
    setData(newData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <FileUpload onDataLoad={handleDataUpload} />
          <ExportPDF data={data} />
        </div>
        
        <Dashboard data={data} />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Server className="mr-2 h-6 w-6 text-primary" />
            Compromised Hosts ({data.host_group.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.host_group.map((host) => (
              <HostCard key={host.paw} host={host} />
            ))}
          </div>
        </div>
        
        <CommandsList steps={data.steps} />
        
        <TacticsSummary steps={data.steps} />
        
        <Timeline 
          steps={data.steps} 
          startTime={data.start} 
          endTime={data.finish} 
        />
      </main>
      
      <footer className="bg-card border-t border-border py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Recon Data Explorer © {new Date().getFullYear()} | Security Operations Dashboard
        </div>
      </footer>
    </div>
  );
};

export default Index;
