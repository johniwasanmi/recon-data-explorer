
import React, { useState } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { supabase } from '@/integrations/supabase/client';
import { ReconData } from '@/types/reconTypes';
import { adaptToHostGroup, SimplifiedHostGroup } from '@/types/hostGroupTypes';

// Import the sample data directly
import sampleData from '@/data/sampleData';

const Index = () => {
  const [data, setData] = useState<ReconData>(() => {
    // Convert the sample data to the correct format
    const formattedSampleData = {
      ...sampleData,
      // Convert the simplified host groups to full host groups
      host_group: (sampleData.host_group as SimplifiedHostGroup[]).map(
        hostGroup => adaptToHostGroup(hostGroup)
      )
    };
    
    return formattedSampleData;
  });

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
