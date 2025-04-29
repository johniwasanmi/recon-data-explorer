
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
      
      const { successful, failed } = getCommandStats();
      pdf.text(`Success Rate: ${Math.round((successful / totalCommands) * 100)}%`, 20, 150);

      pdf.text(`Planner: ${data.planner}`, 20, 170);
      pdf.text(`Adversary: ${data.adversary.name}`, 20, 180);
      
      // Footer
      const pageWidth = pdf.internal.pageSize.getWidth();
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 1`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
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
      pdf.setFont('helvetica', 'bold');
      pdf.text("Command Execution Summary", 20, 75);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Successful Commands: ${successful}`, 30, 85);
      pdf.text(`Failed Commands: ${failed}`, 30, 95);
      pdf.text(`Success Rate: ${Math.round((successful / totalCommands) * 100)}%`, 30, 105);
      
      // Create bar chart for command success/failure
      pdf.setDrawColor(0);
      pdf.setFillColor(39, 174, 96); // Green color for success
      const successBarWidth = (successful / totalCommands) * 100;
      pdf.rect(30, 115, successBarWidth, 10, 'F');
      
      pdf.setFillColor(231, 76, 60); // Red color for failure
      pdf.rect(30 + successBarWidth, 115, 100 - successBarWidth, 10, 'F');
      
      pdf.text("Successful", 30, 135);
      pdf.text("Failed", 90, 135);
      
      // Add a donut chart for platforms
      const platforms = getPlatformCounts();
      pdf.setFont('helvetica', 'bold');
      pdf.text("Platforms Distribution", 20, 155);
      pdf.setFont('helvetica', 'normal');
      
      // Draw donut chart for platforms
      const centerX = 80;
      const centerY = 180;
      const outerRadius = 25;
      const innerRadius = 15;
      
      const colors = ['#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#2ecc71'];
      let startAngle = 0;
      let i = 0;
      
      const platformLabels: [string, number, number][] = [];
      const total = Object.values(platforms).reduce((sum, count) => sum + count, 0);
      
      Object.entries(platforms).forEach(([platform, count]) => {
        const angle = (count / total) * 360;
        const endAngle = startAngle + angle;
        
        // Convert angles to radians for drawing
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        // Draw outer arc
        pdf.setFillColor(colors[i % colors.length]);
        
        // Draw the segment
        pdf.setLineWidth(0.1);
        pdf.setDrawColor(255, 255, 255);
        
        // We need to draw the arc manually since jsPDF doesn't have built-in arc/segment drawing
        const segments = 60; // number of segments to approximate the arc
        const angleStep = (endRad - startRad) / segments;
        
        // Outer arc
        pdf.moveTo(
          centerX + outerRadius * Math.cos(startRad),
          centerY + outerRadius * Math.sin(startRad)
        );
        
        for (let j = 1; j <= segments; j++) {
          const currentAngle = startRad + j * angleStep;
          pdf.lineTo(
            centerX + outerRadius * Math.cos(currentAngle),
            centerY + outerRadius * Math.sin(currentAngle)
          );
        }
        
        // Line to inner circle
        pdf.lineTo(
          centerX + innerRadius * Math.cos(endRad),
          centerY + innerRadius * Math.sin(endRad)
        );
        
        // Inner arc (counter-clockwise)
        for (let j = segments; j >= 0; j--) {
          const currentAngle = startRad + j * angleStep;
          pdf.lineTo(
            centerX + innerRadius * Math.cos(currentAngle),
            centerY + innerRadius * Math.sin(currentAngle)
          );
        }
        
        pdf.fill();
        
        // Calculate position for label
        const middleAngle = startRad + (endRad - startRad) / 2;
        const labelRadius = outerRadius + 10;
        const labelX = centerX + labelRadius * Math.cos(middleAngle);
        const labelY = centerY + labelRadius * Math.sin(middleAngle);
        
        platformLabels.push([platform, labelX, labelY]);
        
        startAngle = endAngle;
        i++;
      });
      
      // Add platform labels
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      platformLabels.forEach(([platform, x, y], idx) => {
        pdf.setFillColor(colors[idx % colors.length]);
        pdf.rect(150, 170 + idx * 10, 5, 5, 'F');
        pdf.text(`${platform}`, 160, 174 + idx * 10);
      });
      
      // Footer
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 2`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // ----- Detailed Statistics Page -----
      pdf.addPage();
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("Detailed Statistics", 20, 15);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Command Execution by Platform", 20, 35);
      
      // Command execution by platform stats
      const platformStats = getCommandsByPlatform();
      const platformKeys = Object.keys(platformStats);
      
      // Horizontal bar chart showing command execution by platform
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      const barHeight = 12;
      const gap = 5;
      const startY = 50;
      const barMaxWidth = 120;
      
      // Find the maximum value for scaling
      const maxCommands = Math.max(...platformKeys.map(platform => 
        platformStats[platform].successful + platformStats[platform].failed
      ));
      
      platformKeys.forEach((platform, idx) => {
        const y = startY + idx * (barHeight + gap * 2);
        const stats = platformStats[platform];
        const total = stats.successful + stats.failed;
        
        // Platform label
        pdf.setFont('helvetica', 'bold');
        pdf.text(platform, 20, y);
        pdf.setFont('helvetica', 'normal');
        
        // Total count
        pdf.text(`${total}`, 185, y);
        
        // Success bar
        pdf.setFillColor(39, 174, 96);
        const successWidth = (stats.successful / maxCommands) * barMaxWidth;
        pdf.rect(50, y + 2, successWidth, barHeight / 2 - 1, 'F');
        
        // Failure bar
        pdf.setFillColor(231, 76, 60);
        const failedWidth = (stats.failed / maxCommands) * barMaxWidth;
        pdf.rect(50, y + barHeight / 2 + 1, failedWidth, barHeight / 2 - 1, 'F');
      });
      
      // Legend
      pdf.setFillColor(39, 174, 96);
      pdf.rect(50, startY + platformKeys.length * (barHeight + gap * 2) + 10, 10, 5, 'F');
      pdf.text("Successful", 65, startY + platformKeys.length * (barHeight + gap * 2) + 15);
      
      pdf.setFillColor(231, 76, 60);
      pdf.rect(110, startY + platformKeys.length * (barHeight + gap * 2) + 10, 10, 5, 'F');
      pdf.text("Failed", 125, startY + platformKeys.length * (barHeight + gap * 2) + 15);
      
      // Tactic distribution
      const tactics = getTacticStats();
      pdf.setFont('helvetica', 'bold');
      pdf.text("Tactic Distribution", 20, startY + platformKeys.length * (barHeight + gap * 2) + 30);
      
      // Create pie chart for tactics
      const tacticCenterX = 100;
      const tacticCenterY = startY + platformKeys.length * (barHeight + gap * 2) + 70;
      const tacticRadius = 30;
      
      const tacticColors = ['#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c', '#e67e22', '#34495e'];
      let tacticStartAngle = 0;
      let t = 0;
      
      const tacticLabels: [string, number, number, number][] = [];
      const tacticTotal = Object.values(tactics).reduce((sum, count) => sum + count, 0);
      
      Object.entries(tactics).forEach(([tactic, count]) => {
        const angle = (count / tacticTotal) * 360;
        const endAngle = tacticStartAngle + angle;
        
        // Convert angles to radians
        const startRad = (tacticStartAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        pdf.setFillColor(tacticColors[t % tacticColors.length]);
        
        // Draw the segment as before
        const segments = 60;
        const angleStep = (endRad - startRad) / segments;
        
        pdf.moveTo(
          tacticCenterX + tacticRadius * Math.cos(startRad),
          tacticCenterY + tacticRadius * Math.sin(startRad)
        );
        
        for (let j = 1; j <= segments; j++) {
          const currentAngle = startRad + j * angleStep;
          pdf.lineTo(
            tacticCenterX + tacticRadius * Math.cos(currentAngle),
            tacticCenterY + tacticRadius * Math.sin(currentAngle)
          );
        }
        
        // Line to center
        pdf.lineTo(tacticCenterX, tacticCenterY);
        pdf.fill();
        
        // Calculate position for label
        const middleAngle = startRad + (endRad - startRad) / 2;
        const percentage = Math.round((count / tacticTotal) * 100);
        
        tacticLabels.push([tactic, count, percentage, t]);
        
        tacticStartAngle = endAngle;
        t++;
      });
      
      // Add tactic labels
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const legendStartX = 150;
      const legendStartY = tacticCenterY - 25;
      
      tacticLabels.forEach(([tactic, count, percentage, idx], i) => {
        const y = legendStartY + i * 10;
        pdf.setFillColor(tacticColors[idx % tacticColors.length]);
        pdf.rect(legendStartX, y - 4, 5, 5, 'F');
        pdf.text(`${tactic} (${percentage}%)`, legendStartX + 10, y);
      });
      
      // Footer
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 3`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
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
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        }
      });
      
      // Commands per host bar chart
      const hostCounts = getHostCommandCounts();
      
      if (Object.keys(hostCounts).length > 0) {
        pdf.setFont('helvetica', 'bold');
        const tableHeight = hostTableData.length * 10 + 20; // Approximate table height
        pdf.text("Commands Per Host", 20, tableHeight + 40);
        
        // Horizontal bar chart for commands per host
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        
        const hostBarHeight = 8;
        const hostGap = 4;
        const hostStartY = tableHeight + 50;
        const hostBarMaxWidth = 120;
        
        // Find the maximum value for scaling
        const maxHostCommands = Math.max(...Object.values(hostCounts));
        
        Object.entries(hostCounts).forEach(([host, count], idx) => {
          const y = hostStartY + idx * (hostBarHeight + hostGap);
          
          // Host label
          pdf.text(host, 20, y + hostBarHeight / 2);
          
          // Bar
          pdf.setFillColor(80, 100, 180);
          const width = (count / maxHostCommands) * hostBarMaxWidth;
          pdf.rect(70, y, width, hostBarHeight, 'F');
          
          // Count label
          pdf.text(`${count}`, 75 + width, y + hostBarHeight / 2);
        });
      }
      
      // Footer
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 4`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
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
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        }
      });
      
      // Footer
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 5`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
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
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          3: { cellWidth: 60 }
        }
      });
      
      // Footer
      pdf.setFillColor(20, 20, 30);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 6`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // Save the PDF
      const filename = `recon-report-${data.name}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);

      toast({
        title: "Professional Report Generated",
        description: "Your detailed PDF report with visualizations has been successfully downloaded.",
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
