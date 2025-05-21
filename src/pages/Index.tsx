
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import { ReconData } from '@/types/reconTypes';
import { adaptToHostGroup, SimplifiedHostGroup } from '@/types/hostGroupTypes';

// Import the sample data correctly
import { sampleReconData } from '@/data/sampleData';

const Index = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReconData>({
    ...sampleReconData,
    // Convert the simplified host groups to full host groups
    host_group: (sampleReconData.host_group as SimplifiedHostGroup[]).map(
      hostGroup => adaptToHostGroup(hostGroup)
    )
  });
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Dashboard data={data} />
      </main>
    </div>
  );
};

export default Index;
