
import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { UserReport } from '@/types/reconTypes';
import Dashboard from '@/components/Dashboard';
import HostCard from '@/components/HostCard';
import CommandsList from '@/components/CommandsList';
import TacticsSummary from '@/components/TacticsSummary';
import Timeline from '@/components/Timeline';
import ExportPDF from '@/components/ExportPDF';
import Header from '@/components/Header';
import { ArrowLeft, Server, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReportView = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<UserReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !reportId) return;

    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', reportId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setReport(data);
      } catch (error: any) {
        console.error('Error fetching report:', error);
        toast({
          title: 'Error loading report',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [user, reportId, toast]);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-semibold">Loading report...</h2>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Report not found</h2>
          <p className="text-muted-foreground mb-8">The report you requested could not be found.</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </main>
      </div>
    );
  }

  const { report_data } = report;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={() => window.location.href = '/dashboard'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">{report.name}</h1>
            <p className="text-muted-foreground">{report.description}</p>
          </div>
          <ExportPDF data={report_data} />
        </div>
        
        <Dashboard data={report_data} />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Server className="mr-2 h-6 w-6 text-primary" />
            Compromised Hosts ({report_data.host_group.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {report_data.host_group.map((host) => (
              <HostCard key={host.paw} host={host} />
            ))}
          </div>
        </div>
        
        <CommandsList steps={report_data.steps} />
        
        <TacticsSummary steps={report_data.steps} />
        
        <Timeline 
          steps={report_data.steps} 
          startTime={report_data.start} 
          endTime={report_data.finish} 
        />
      </main>
    </div>
  );
};

export default ReportView;
