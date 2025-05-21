
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ReconData } from '../types/reconTypes';
import { FileDown, Loader2 } from 'lucide-react';
import { pdf, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

// Register custom fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeAmM.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeAmM.woff2', fontWeight: 'bold' },
  ],
});

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    padding: 30,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    marginTop: 20,
    paddingBottom: 5,
    borderBottom: '1px solid #e5e7eb',
  },
  text: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 5,
    lineHeight: 1.5,
  },
  bold: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: 8,
    paddingTop: 8,
  },
  column: {
    flex: 1,
    padding: 5,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logo: {
    width: 40,
    height: 40,
  },
  chartsRow: {
    flexDirection: 'row',
    marginVertical: 15,
    gap: 10,
  },
  chartContainer: {
    flex: 1,
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    padding: 10,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: '#9ca3af',
  },
  networkChartImage: {
    width: '100%',
    marginVertical: 15,
    border: '1px solid #e5e7eb',
    borderRadius: 5,
  },
  timelineContainer: {
    marginVertical: 15,
    border: '1px solid #e5e7eb',
    borderRadius: 5,
    padding: 10,
  },
  timelineEvent: {
    marginBottom: 8,
    paddingLeft: 15,
    borderLeft: '2px solid #6366f1',
  },
  timelineDate: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  timelineContent: {
    fontSize: 11,
    color: '#374151',
  },
});

// PDF Document Component
const ReconDataDocument = ({ data }: { data: ReconData }) => {
  // Generate data for charts
  const platformData = data.host_group.reduce((acc, host) => {
    const platform = host.platform;
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const platformChartData = Object.keys(platformData).map(platform => ({
    name: platform,
    value: platformData[platform]
  }));

  // Create tactics frequency data
  const tacticsData: Record<string, number> = {};
  
  Object.values(data.steps).forEach(hostSteps => {
    hostSteps.steps.forEach(step => {
      if (step.attack?.tactic) {
        const tactic = step.attack.tactic;
        tacticsData[tactic] = (tacticsData[tactic] || 0) + 1;
      }
    });
  });
  
  const tacticsChartData = Object.keys(tacticsData).map(tactic => ({
    name: tactic,
    count: tacticsData[tactic]
  }));

  // Extract command status data
  const statusData: Record<string, number> = {
    success: 0,
    failed: 0
  };
  
  Object.values(data.steps).forEach(hostSteps => {
    hostSteps.steps.forEach(step => {
      if (step.status === 0) {
        statusData.success++;
      } else {
        statusData.failed++;
      }
    });
  });
  
  const statusChartData = [
    { name: 'Success', value: statusData.success },
    { name: 'Failed', value: statusData.failed }
  ];

  // Create timeline data
  const allEvents: Array<{ 
    time: string; 
    type: string; 
    host: string;
    description?: string;
    name?: string;
  }> = [
    {
      time: data.start,
      type: 'operation',
      host: 'System',
      description: 'Operation started'
    }
  ];

  // Add command execution events
  Object.entries(data.steps).forEach(([_, hostSteps]) => {
    hostSteps.steps.forEach(step => {
      allEvents.push({
        time: step.run,
        type: 'command',
        host: step.platform,
        description: step.description,
        name: step.name
      });
    });
  });

  // Add operation end event
  allEvents.push({
    time: data.finish,
    type: 'operation',
    host: 'System',
    description: 'Operation completed'
  });

  // Sort events by time
  allEvents.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // External logo URL
  const logoUrl = "https://static.wixstatic.com/media/a7f3a2_ef354985b92d4092b0c56935a9563993~mv2.png";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoUrl} style={styles.logo} />
          <View>
            <Text style={styles.title}>Caldera Recon Report</Text>
            <Text style={styles.text}>{data.name}</Text>
          </View>
        </View>
        
        {/* Operation Summary */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Operation Summary</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Start Time:</Text> {new Date(data.start).toLocaleString()}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>End Time:</Text> {new Date(data.finish).toLocaleString()}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Total Hosts:</Text> {data.host_group.length}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Commands Executed:</Text> {
              Object.values(data.steps).reduce((total, hostSteps) => total + hostSteps.steps.length, 0)
            }
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Planner:</Text> {data.planner}
          </Text>
          {data.objectives && (
            <Text style={styles.text}>
              <Text style={styles.bold}>Objective:</Text> {data.objectives.name} ({data.objectives.percentage}% complete)
            </Text>
          )}
        </View>
        
        {/* Charts Row 1 */}
        <View style={styles.chartsRow}>
          {/* Platform Distribution */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Host Platform Distribution</Text>
            {platformChartData.map((entry, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.column}>{entry.name}</Text>
                <Text style={styles.column}>{entry.value}</Text>
              </View>
            ))}
          </View>
          
          {/* Command Status */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Command Execution Status</Text>
            {statusChartData.map((entry, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.column}>{entry.name}</Text>
                <Text style={styles.column}>{entry.value}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Charts Row 2 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>MITRE ATT&CK Tactics Summary</Text>
          {tacticsChartData.map((entry, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.column}>{entry.name}</Text>
              <Text style={styles.column}>{entry.count}</Text>
            </View>
          ))}
        </View>
        
        {/* Compromised Hosts */}
        <View style={styles.section} break>
          <Text style={styles.subtitle}>Compromised Hosts</Text>
          
          {/* Table Headers */}
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.column}>Host</Text>
            <Text style={styles.column}>Platform</Text>
            <Text style={styles.column}>Username</Text>
            <Text style={styles.column}>IP</Text>
          </View>
          
          {/* Table Rows */}
          {data.host_group.map((host, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.column}>{host.host}</Text>
              <Text style={styles.column}>{host.platform}</Text>
              <Text style={styles.column}>{host.username}</Text>
              <Text style={styles.column}>{host.host_ip_addrs.join(', ')}</Text>
            </View>
          ))}
        </View>
        
        {/* Timeline View */}
        <View style={styles.section} break>
          <Text style={styles.subtitle}>Operation Timeline</Text>
          <View style={styles.timelineContainer}>
            {allEvents.slice(0, 20).map((event, index) => (
              <View key={index} style={styles.timelineEvent}>
                <Text style={styles.timelineDate}>
                  {new Date(event.time).toLocaleString()}
                </Text>
                <Text style={styles.timelineContent}>
                  <Text style={styles.bold}>{event.host}: </Text>
                  {event.type === 'operation' ? event.description : event.name}
                </Text>
              </View>
            ))}
            {allEvents.length > 20 && (
              <Text style={[styles.text, { textAlign: 'center', marginTop: 10 }]}>
                +{allEvents.length - 20} more events
              </Text>
            )}
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated on {new Date().toLocaleString()} | Caldera Recon Explorer
          </Text>
        </View>
      </Page>
    </Document>
  );
};

interface ExportPDFProps {
  data: ReconData;
}

const ExportPDF: React.FC<ExportPDFProps> = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Generate PDF document
      const blob = await pdf(<ReconDataDocument data={data} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.name || 'recon-report'}.pdf`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF Generated',
        description: 'Your report has been downloaded.'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error Generating PDF',
        description: 'There was a problem creating your PDF report.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isGenerating}
      className="flex items-center gap-2"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isGenerating ? 'Generating PDF...' : 'Export PDF Report'}
    </Button>
  );
};

export default ExportPDF;
