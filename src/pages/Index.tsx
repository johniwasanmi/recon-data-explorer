
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';
import { adaptToHostGroup } from '@/types/hostGroupTypes';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Initialize with sample data, properly typed with the adaptToHostGroup helper
  const [data, setData] = useState<ReconData>({
    ...sampleReconData,
    jitter: "0",
    objectives: {
      id: "sample-objective-1",
      name: "Sample Objective",
      description: "Default objective for demonstration",
      goals: [],
      percentage: 0
    },
    host_group: sampleReconData.host_group.map(adaptToHostGroup),
    skipped_abilities: []
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          // Redirect to login if not authenticated
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleDataUpload = (newData: ReconData) => {
    setData(newData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
