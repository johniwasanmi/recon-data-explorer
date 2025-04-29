
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { ReconData, Step } from '../types/reconTypes';
import { formatDate, getDurationInMinutes } from '../utils/dateUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const generatePDF = async () => {
    toast({
      title: "Generating PDF Report",
      description: "Please wait while we compile your professional report...",
    });

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // ----- Cover Page -----
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 60, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text(`Reconnaissance Report`, 20, 30);
      
      pdf.setFontSize(16);
      pdf.text(`Operation: ${data.name}`, 20, 45);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      pdf.text(`Generated: ${formatDate(new Date().toISOString())}`, 20, 80);
      pdf.text(`Operation Start: ${formatDate(data.start)}`, 20, 90);
      pdf.text(`Operation End: ${formatDate(data.finish)}`, 20, 100);
      
      const opDuration = getDurationInMinutes(data.start, data.finish);
      pdf.text(`Operation Duration: ${opDuration} minutes`, 20, 110);
      
      pdf.text(`Total Hosts Compromised: ${data.host_group.length}`, 20, 130);
      
      const totalCommands = Object.values(data.steps).reduce(
        (acc, hostSteps) => acc + hostSteps.steps.length, 0
      );
      pdf.text(`Total Commands Executed: ${totalCommands}`, 20, 140);

      pdf.text(`Planner: ${data.planner}`, 20, 160);
      pdf.text(`Adversary: ${data.adversary.name}`, 20, 170);
      pdf.text(`Adversary Description: ${data.adversary.description}`, 20, 180);
      
      // ----- Executive Summary Page -----
      pdf.addPage();
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("Executive Summary", 20, 15);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Operation Overview", 20, 30);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`This report summarizes the reconnaissance operation "${data.name}" conducted from `, 20, 40);
      pdf.text(`${formatDate(data.start)} to ${formatDate(data.finish)}.`, 20, 48);
      pdf.text(`A total of ${data.host_group.length} hosts were compromised and ${totalCommands} commands were executed.`, 20, 56);
      
      // Command success/failure stats
      const { successful, failed } = getCommandStats();
      pdf.setFont('helvetica', 'bold');
      pdf.text("Command Execution Summary", 20, 75);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Successful Commands: ${successful}`, 30, 85);
      pdf.text(`Failed Commands: ${failed}`, 30, 95);
      pdf.text(`Success Rate: ${Math.round((successful / totalCommands) * 100)}%`, 30, 105);
      
      // Create simple bar chart for command success/failure
      pdf.setDrawColor(0);
      pdf.setFillColor(39, 174, 96);
      const successBarWidth = (successful / totalCommands) * 100;
      pdf.rect(30, 115, successBarWidth, 10, 'F');
      
      pdf.setFillColor(231, 76, 60);
      pdf.rect(30 + successBarWidth, 115, 100 - successBarWidth, 10, 'F');
      
      pdf.text("Successful", 30, 135);
      pdf.text("Failed", 80, 135);

      // ----- Hosts Summary Page -----
      pdf.addPage();
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("Compromised Hosts", 20, 15);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Create a table for hosts
      const hostTableData = data.host_group.map(host => [
        host.host,
        host.platform,
        host.host_ip_addrs?.join(', ') || 'N/A',
        host.username,
        formatDate(host.created)
      ]);
      
      autoTable(pdf, {
        head: [['Hostname', 'Platform', 'IP Addresses', 'Username', 'Compromise Time']],
        body: hostTableData,
        startY: 30,
        theme: 'grid',
        headStyles: {
          fillColor: [50, 50, 75],
          textColor: [255, 255, 255]
        },
        styles: {
          fontSize: 9
        }
      });
      
      // ----- Tactics and Techniques Page -----
      pdf.addPage();
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("MITRE ATT&CK Tactics & Techniques", 20, 15);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Collect all unique techniques
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
      
      // Create a table for techniques
      const techniqueTableData = Array.from(techniques).map(technique => {
        const data = techniqueData[technique];
        return [
          technique,
          data.tactic,
          data.count.toString()
        ];
      });
      
      autoTable(pdf, {
        head: [['Technique', 'Tactic', 'Count']],
        body: techniqueTableData,
        startY: 30,
        theme: 'grid',
        headStyles: {
          fillColor: [50, 50, 75],
          textColor: [255, 255, 255]
        },
        styles: {
          fontSize: 9
        }
      });
      
      // ----- Command Execution Timeline -----
      pdf.addPage();
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("Command Execution Timeline", 20, 15);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      // Get all steps and sort by time
      const allStepsSorted = getAllSteps().sort((a, b) => 
        new Date(a.run).getTime() - new Date(b.run).getTime()
      );
      
      const timelineData = allStepsSorted.map(step => {
        const host = Object.entries(data.steps).find(([_, hostData]) => 
          hostData.steps.some(s => s.link_id === step.link_id)
        )?.[0] || '';
        
        const hostname = data.host_group.find(h => h.paw === host)?.host || host;
        
        return [
          formatDate(step.run),
          hostname,
          step.name,
          step.command,
          step.status === 0 ? "Success" : "Failed"
        ];
      });
      
      autoTable(pdf, {
        head: [['Timestamp', 'Host', 'Operation', 'Command', 'Status']],
        body: timelineData,
        startY: 30,
        theme: 'grid',
        headStyles: {
          fillColor: [50, 50, 75],
          textColor: [255, 255, 255]
        },
        styles: {
          fontSize: 8
        },
        columnStyles: {
          3: { cellWidth: 60 }
        }
      });

      // Save the PDF
      const filename = `recon-report-${data.name}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);

      toast({
        title: "Professional Report Generated",
        description: "Your detailed PDF report has been successfully downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error Generating Report",
        description: "There was an error creating your professional report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={generatePDF}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export Professional Report
    </Button>
  );
};

export default ExportPDF;
