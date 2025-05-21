
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { ReconData, Step } from '../types/reconTypes';
import { formatDate, getDurationInMinutes } from '../utils/dateUtils';
import { 
  Document, Page, Text, View, StyleSheet, PDFDownloadLink, 
  Font, Image, Link
} from '@react-pdf/renderer';

// Register fonts for better typography
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 'semibold' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 'bold' },
  ]
});

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Open Sans',
    fontSize: 12,
    color: '#333',
    backgroundColor: '#fff',
  },
  coverPage: {
    padding: 30,
    fontFamily: 'Open Sans',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  header: {
    backgroundColor: '#84e39d', // Light green header
    padding: '20px 30px',
    marginBottom: 20,
    marginHorizontal: -30,
    marginTop: -30,
  },
  coverHeader: {
    marginTop: 80,
    marginBottom: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4b5563',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    marginTop: 15,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  text: {
    marginBottom: 8,
    lineHeight: 1.6,
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    width: '48%',
    margin: '1%',
    borderRadius: 4,
  },
  stat: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    padding: 8,
    minHeight: 30,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  alertSuccess: {
    color: '#059669',
    fontWeight: 'semibold',
  },
  alertDanger: {
    color: '#e11d48',
    fontWeight: 'semibold',
  },
  progressContainer: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginVertical: 5,
    width: '100%',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  barSuccess: {
    backgroundColor: '#34d399',
  },
  barDanger: {
    backgroundColor: '#f43f5e',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 3,
  },
  platformWindows: { backgroundColor: '#3b82f6' },
  platformLinux: { backgroundColor: '#ec4899' },
  platformDarwin: { backgroundColor: '#f59e0b' },
  platformOther: { backgroundColor: '#14b8a6' },
  tacticExec: { backgroundColor: '#8b5cf6' },
  tacticDisc: { backgroundColor: '#ec4899' },
  tacticPers: { backgroundColor: '#f59e0b' },
  tacticPriv: { backgroundColor: '#14b8a6' },
  tacticDef: { backgroundColor: '#6366f1' },
  disclaimer: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    fontSize: 9,
    color: '#9ca3af',
  },
  coverFooter: {
    marginBottom: 50,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 11,
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  centeredContent: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  barChartContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barChartLabel: {
    width: '30%',
    fontSize: 10,
    color: '#4b5563',
  },
  barChartBar: {
    height: 10,
    marginRight: 10,
    borderRadius: 2,
  },
  barChartValue: {
    fontSize: 10,
    fontWeight: 'semibold',
    color: '#374151',
    width: '15%',
    textAlign: 'right',
  },
});

interface ExportPDFProps {
  data: ReconData;
}

const ExportPDF: React.FC<ExportPDFProps> = ({ data }) => {
  // Helper function to count successful vs failed commands
  const getCommandStats = () => {
    let successful = 0;
    let failed = 0;
    
    Object.values(data.steps).forEach(hostSteps => {
      hostSteps.steps.forEach(step => {
        if (step.status === 0) successful++;
        else failed++;
      });
    });
    
    return { successful, failed };
  };

  // Helper function to count techniques by tactic
  const getTacticStats = () => {
    const tactics: Record<string, number> = {};
    
    Object.values(data.steps).forEach(hostSteps => {
      hostSteps.steps.forEach(step => {
        const tactic = step.attack.tactic;
        tactics[tactic] = (tactics[tactic] || 0) + 1;
      });
    });
    
    return tactics;
  };

  // Helper function to count commands by host
  const getHostCommandCounts = () => {
    const hostCounts: Record<string, number> = {};
    
    Object.entries(data.steps).forEach(([paw, hostSteps]) => {
      const host = data.host_group.find(h => h.paw === paw)?.host || paw;
      hostCounts[host] = hostSteps.steps.length;
    });
    
    return hostCounts;
  };

  // Helper function to get all steps from all hosts
  const getAllSteps = (): Step[] => {
    const allSteps: Step[] = [];
    Object.values(data.steps).forEach(hostSteps => {
      allSteps.push(...hostSteps.steps);
    });
    return allSteps;
  };

  // Helper function to count platforms
  const getPlatformCounts = () => {
    const platforms: Record<string, number> = {};
    
    data.host_group.forEach(host => {
      const platform = host.platform;
      platforms[platform] = (platforms[platform] || 0) + 1;
    });
    
    return platforms;
  };

  // Helper function to count commands by status per platform
  const getCommandsByPlatform = () => {
    const platformStats: Record<string, { successful: number; failed: number }> = {};
    
    Object.entries(data.steps).forEach(([paw, hostSteps]) => {
      const host = data.host_group.find(h => h.paw === paw);
      if (host) {
        const platform = host.platform;
        if (!platformStats[platform]) {
          platformStats[platform] = { successful: 0, failed: 0 };
        }
        
        hostSteps.steps.forEach(step => {
          if (step.status === 0) {
            platformStats[platform].successful++;
          } else {
            platformStats[platform].failed++;
          }
        });
      }
    });
    
    return platformStats;
  };

  // Create a React-PDF Document
  const ReportDocument = () => {
    const { successful, failed } = getCommandStats();
    const totalCommands = successful + failed;
    const successRate = Math.round((successful / totalCommands) * 100);
    
    const allStepsSorted = getAllSteps().sort((a, b) => 
      new Date(a.run).getTime() - new Date(b.run).getTime()
    );
    
    const tactics = getTacticStats();
    const sortedTactics = Object.entries(tactics)
      .sort(([, countA], [, countB]) => countB - countA);
    
    const hostCounts = getHostCommandCounts();
    const sortedHosts = Object.entries(hostCounts)
      .sort(([, countA], [, countB]) => countB - countA);
    
    const platforms = getPlatformCounts();
    const platformStats = getCommandsByPlatform();
    
    // Collection of unique techniques
    const techniques = new Set<string>();
    const techniqueData: Record<string, { tactic: string, count: number }> = {};
    
    getAllSteps().forEach(step => {
      const techniqueId = step.attack.technique_id;
      if (techniqueId) {
        const key = `${techniqueId}: ${step.attack.technique_name}`;
        techniques.add(key);
        if (!techniqueData[key]) {
          techniqueData[key] = { tactic: step.attack.tactic, count: 0 };
        }
        techniqueData[key].count++;
      }
    });
    
    const operationDuration = getDurationInMinutes(data.start, data.finish);

    return (
      <Document>
        {/* Cover Page */}
        <Page size="A4" style={styles.coverPage}>
          <View>
            <View style={styles.coverHeader}>
              <Text style={styles.coverTitle}>Reconnaissance Report</Text>
              <Text style={styles.subtitle}>Operation: {data.name}</Text>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.text}>This report provides a comprehensive overview of the reconnaissance operation conducted from {formatDate(data.start)} to {formatDate(data.finish)}. It includes insights on host compromises, command execution, and ATT&CK techniques utilized.</Text>
            </View>
            
            <View style={styles.flexRow}>
              <View style={styles.statCard}>
                <Text style={styles.stat}>{data.host_group.length}</Text>
                <Text style={styles.statLabel}>HOSTS COMPROMISED</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.stat}>{totalCommands}</Text>
                <Text style={styles.statLabel}>COMMANDS EXECUTED</Text>
              </View>
            </View>
            
            <View style={styles.flexRow}>
              <View style={styles.statCard}>
                <Text style={styles.stat}>{operationDuration} min</Text>
                <Text style={styles.statLabel}>OPERATION DURATION</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.stat}>{successRate}%</Text>
                <Text style={styles.statLabel}>SUCCESS RATE</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.coverFooter}>
            <Text style={styles.text}>Generated: {formatDate(new Date().toISOString())}</Text>
            <Text style={styles.text}>Planner: {data.planner}</Text>
          </View>
        </Page>
        
        {/* Executive Summary Page */}
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Executive Summary</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.text}>
              This report summarizes the reconnaissance operation "{data.name}" conducted from {formatDate(data.start)} to {formatDate(data.finish)}. The operation lasted {operationDuration} minutes and targeted {data.host_group.length} hosts across {Object.keys(platforms).length} different platforms.
            </Text>
            <Text style={styles.text}>
              A total of {totalCommands} commands were executed with a success rate of {successRate}%. The operation was conducted using the "{data.adversary.name}" adversary profile.
            </Text>
          </View>
          
          <Text style={styles.sectionTitle}>Key Findings</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Command Success/Failure Ratio</Text>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  styles.barSuccess, 
                  { width: `${successRate}%` }
                ]} 
              />
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.text}>Successful: {successful} ({successRate}%)</Text>
              <Text style={[styles.text, { marginLeft: 20 }]}>Failed: {failed} ({100 - successRate}%)</Text>
            </View>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Platform Distribution ({Object.keys(platforms).length})</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              {Object.entries(platforms).map(([platform, count], idx) => (
                <View style={styles.legendItem} key={idx}>
                  <View 
                    style={[
                      styles.legendColor, 
                      platform === 'Windows' ? styles.platformWindows : 
                      platform === 'Linux' ? styles.platformLinux : 
                      platform === 'Darwin' ? styles.platformDarwin : styles.platformOther
                    ]} 
                  />
                  <Text style={{ fontSize: 10 }}>{platform}: {count}</Text>
                </View>
              ))}
            </View>
            
            {/* Platform success rates */}
            <View style={styles.barChartContainer}>
              {Object.entries(platformStats).map(([platform, stats], idx) => {
                const total = stats.successful + stats.failed;
                const rate = Math.round((stats.successful / total) * 100);
                return (
                  <View style={styles.barChartRow} key={idx}>
                    <Text style={styles.barChartLabel}>{platform}</Text>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          rate > 70 ? styles.barSuccess : styles.barDanger,
                          { width: `${rate}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.barChartValue}>{rate}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Top Tactics Used</Text>
            <View style={styles.barChartContainer}>
              {sortedTactics.slice(0, 5).map(([tactic, count], idx) => {
                const percentage = Math.round((count / totalCommands) * 100);
                const tacticColor = 
                  idx === 0 ? styles.tacticExec : 
                  idx === 1 ? styles.tacticDisc : 
                  idx === 2 ? styles.tacticPers : 
                  idx === 3 ? styles.tacticPriv : styles.tacticDef;
                  
                return (
                  <View style={styles.barChartRow} key={idx}>
                    <Text style={styles.barChartLabel}>
                      {tactic.length > 15 ? tactic.substring(0, 12) + '...' : tactic}
                    </Text>
                    <View 
                      style={[
                        styles.barChartBar, 
                        tacticColor,
                        { width: `${percentage}%` }
                      ]} 
                    />
                    <Text style={styles.barChartValue}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text>CONFIDENTIAL - Reconnaissance Report - Page 2</Text>
          </View>
        </Page>
        
        {/* Host Details Page */}
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Compromised Hosts</Text>
          </View>
          
          <Text style={styles.text}>
            This section details the {data.host_group.length} hosts that were compromised during the operation.
            Each host is identified by its unique identifier, platform, and other relevant attributes.
          </Text>
          
          <View style={{ marginVertical: 10 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Host</Text>
              <Text style={styles.tableHeaderCell}>Platform</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>IP Addresses</Text>
              <Text style={styles.tableHeaderCell}>Username</Text>
            </View>
            
            {data.host_group.map((host, idx) => (
              <View style={[styles.tableRow, idx % 2 === 0 ? { backgroundColor: '#f8fafc' } : {}]} key={idx}>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'semibold' }]}>{host.host}</Text>
                <Text style={styles.tableCell}>{host.platform}</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{host.host_ip_addrs?.join(', ') || 'N/A'}</Text>
                <Text style={styles.tableCell}>{host.username}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Commands Per Host</Text>
          <View style={styles.card}>
            <View style={styles.barChartContainer}>
              {sortedHosts.slice(0, 8).map(([host, count], idx) => {
                // Calculate max commands for relative display
                const maxCommands = Math.max(...Object.values(hostCounts));
                const percentage = Math.round((count / maxCommands) * 100);
                
                return (
                  <View style={styles.barChartRow} key={idx}>
                    <Text style={styles.barChartLabel}>
                      {host.length > 15 ? host.substring(0, 12) + '...' : host}
                    </Text>
                    <View 
                      style={[
                        styles.barChartBar, 
                        { backgroundColor: `rgb(${59 + idx * 10}, ${130 - idx * 7}, 246)`, width: `${percentage}%` }
                      ]} 
                    />
                    <Text style={styles.barChartValue}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text>CONFIDENTIAL - Reconnaissance Report - Page 3</Text>
          </View>
        </Page>
        
        {/* MITRE ATT&CK Techniques Page */}
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>MITRE ATT&CK Techniques</Text>
          </View>
          
          <Text style={styles.text}>
            This section details the MITRE ATT&CK techniques used during the operation. 
            The techniques are categorized by tactic and ranked by frequency of use.
          </Text>
          
          <View style={{ marginVertical: 10 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Technique</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Tactic</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Count</Text>
            </View>
            
            {Array.from(techniques).map((technique, idx) => {
              const data = techniqueData[technique];
              return (
                <View style={[styles.tableRow, idx % 2 === 0 ? { backgroundColor: '#f8fafc' } : {}]} key={idx}>
                  <Text style={[styles.tableCell, { flex: 2, fontWeight: 'semibold' }]}>{technique}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{data.tactic}</Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>{data.count}</Text>
                </View>
              );
            })}
          </View>
          
          <View style={styles.footer}>
            <Text>CONFIDENTIAL - Reconnaissance Report - Page 4</Text>
          </View>
        </Page>
        
        {/* Command Execution Timeline */}
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Command Execution Timeline</Text>
          </View>
          
          <Text style={styles.text}>
            This section provides a chronological view of all commands executed during the operation.
            The timeline shows when each command was run, on which host, and whether it was successful.
          </Text>
          
          <View style={{ marginVertical: 10 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Timestamp</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Host</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Operation</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Command</Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.7 }]}>Status</Text>
            </View>
            
            {allStepsSorted.slice(0, 30).map((step, idx) => {
              const host = Object.entries(data.steps).find(([_, hostData]) => 
                hostData.steps.some(s => s.link_id === step.link_id)
              )?.[0] || '';
              
              const hostname = data.host_group.find(h => h.paw === host)?.host || host;
              const success = step.status === 0;
              
              return (
                <View style={[styles.tableRow, idx % 2 === 0 ? { backgroundColor: '#f8fafc' } : {}]} key={idx}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(step.run)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{hostname}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {step.name.length > 20 ? step.name.substring(0, 17) + '...' : step.name}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {step.command.length > 30 ? step.command.substring(0, 27) + '...' : step.command}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.7 }, success ? styles.alertSuccess : styles.alertDanger]}>
                    {success ? 'Success' : 'Failed'}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {allStepsSorted.length > 30 && (
            <Text style={styles.text}>
              Note: Showing 30 of {allStepsSorted.length} commands. See the full dataset for complete details.
            </Text>
          )}
          
          <View style={styles.footer}>
            <Text>CONFIDENTIAL - Reconnaissance Report - Page 5</Text>
          </View>
        </Page>
      </Document>
    );
  };

  const handleExportClick = () => {
    toast({
      title: "Preparing Your Report",
      description: "The PDF is being generated. Once ready, it will download automatically.",
    });
  };

  return (
    <PDFDownloadLink
      document={<ReportDocument />}
      fileName={`recon-report-${data.name}-${new Date().toISOString().slice(0, 10)}.pdf`}
      className="inline-block"
      onClick={handleExportClick}
    >
      {({ blob, url, loading, error }) => (
        <Button 
          variant="outline" 
          disabled={loading}
          className="flex items-center gap-2 bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Generating Report...' : 'Export Professional Report'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default ExportPDF;
