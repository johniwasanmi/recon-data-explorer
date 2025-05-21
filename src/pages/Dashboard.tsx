
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, History, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { UserReport, ReconData } from '@/types/reconTypes';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setReports(data || []);
      } catch (error: any) {
        console.error('Error fetching reports:', error);
        toast({
          title: 'Error fetching your reports',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user, toast]);

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDataSave = async (data: ReconData) => {
    try {
      const { error } = await supabase.from('reports').insert({
        user_id: user!.id,
        name: data.name || 'Unnamed Report',
        description: `Operation from ${new Date(data.start).toLocaleDateString()} to ${new Date(data.finish).toLocaleDateString()}`,
        report_data: data
      });

      if (error) throw error;

      toast({
        title: 'Report saved',
        description: 'Your report has been saved successfully.',
      });

      // Refresh reports list
      const { data: updatedReports } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      setReports(updatedReports || []);
      
    } catch (error: any) {
      console.error('Error saving report:', error);
      toast({
        title: 'Error saving report',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewReport = (reportId: string) => {
    window.location.href = `/report/${reportId}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Caldera Recon Explorer</h1>
          <p className="text-muted-foreground text-lg">
            Upload and analyze your Caldera recon data
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
              <Upload className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Upload your first report</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Get started by uploading a JSON file exported from Caldera to visualize your recon data
            </p>
            <FileUpload onDataLoad={handleDataSave} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload New Report
                </CardTitle>
                <CardDescription>
                  Upload a new JSON file exported from Caldera to visualize
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onDataLoad={handleDataSave} />
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <History className="mr-2 h-6 w-6 text-primary" />
                Your Reports
              </h2>
              
              {isLoading ? (
                <div className="text-center py-8">Loading your reports...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="overflow-hidden hover:border-primary/50 transition-all">
                      <CardHeader className="bg-card pb-2">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {report.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>
                            {report.report_data.host_group?.length || 0} hosts, 
                            {' '}{Object.keys(report.report_data.steps || {}).length || 0} steps
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          Created on {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        <Button 
                          onClick={() => handleViewReport(report.id)} 
                          className="w-full"
                        >
                          View Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
