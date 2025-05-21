
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

      // Modern color palette
      const colors = {
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        secondary: '#ec4899',
        secondaryDark: '#db2777',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        light: '#f9fafb',
        dark: '#1f2937',
        headerBg:'#84e39d',
        //headerBg: '#1e293b',
        headerText: '#f8fafc',
        tableBorder: '#cbd5e1',
        tableHeader: '#f1f5f9',
        tableHeaderText: '#0f172a'
      };
      
      // ----- Cover Page -----
      // Header bar with solid color instead of gradient
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 60, 'F');
      
      // Report title with modern font
      pdf.setTextColor(colors.headerText);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.text(`Reconnaissance Report`, 20, 30);
      
      pdf.setFontSize(18);
      pdf.text(`Operation: ${data.name}`, 20, 45);
      
      // Report details with clean layout
      pdf.setTextColor(colors.dark);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const contentStartY = 80;
      
      // Add a subtle background to the content area
      pdf.setFillColor('#f8fafc');
      pdf.rect(15, contentStartY - 10, pageWidth - 30, 100, 'F');
      
      pdf.setTextColor(colors.dark);
      pdf.text(`Generated: ${formatDate(new Date().toISOString())}`, 20, contentStartY);
      pdf.text(`Operation Start: ${formatDate(data.start)}`, 20, contentStartY + 10);
      pdf.text(`Operation End: ${formatDate(data.finish)}`, 20, contentStartY + 20);
      
      const opDuration = getDurationInMinutes(data.start, data.finish);
      pdf.text(`Operation Duration: ${opDuration} minutes`, 20, contentStartY + 30);
      
      // Add a horizontal separator line
      pdf.setDrawColor(colors.tableBorder);
      pdf.line(20, contentStartY + 40, pageWidth - 20, contentStartY + 40);
      
      // Key metrics with visual indicators
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Key Metrics`, 20, contentStartY + 50);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`Total Hosts Compromised:`, 25, contentStartY + 60);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary);
      pdf.text(`${data.host_group.length}`, pageWidth - 30, contentStartY + 60, { align: 'right' });
      pdf.setTextColor(colors.dark);
      
      const totalCommands = Object.values(data.steps).reduce(
        (acc, hostSteps) => acc + hostSteps.steps.length, 0
      );
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Commands Executed:`, 25, contentStartY + 70);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(colors.primary);
      pdf.text(`${totalCommands}`, pageWidth - 30, contentStartY + 70, { align: 'right' });
      pdf.setTextColor(colors.dark);
      
      const { successful, failed } = getCommandStats();
      const successRate = Math.round((successful / totalCommands) * 100);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Success Rate:`, 25, contentStartY + 80);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(successRate > 80 ? colors.success : successRate > 50 ? colors.warning : colors.danger);
      pdf.text(`${successRate}%`, pageWidth - 30, contentStartY + 80, { align: 'right' });
      pdf.setTextColor(colors.dark);
      
      // Operation information
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Operation Details`, 20, contentStartY + 95);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`Planner: ${data.planner}`, 25, contentStartY + 105);
      pdf.text(`Adversary: ${data.adversary.name}`, 25, contentStartY + 115);
      
      // Add a graphic summary using progress bars
      const barY = 210;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Command Execution Summary', 20, barY - 10);
      
      // Success/Failure bar with solid colors instead of gradient
      const barWidth = 170;
      const barHeight = 20;
      const successWidth = (successful / totalCommands) * barWidth;
      
      // Draw outline
      pdf.setDrawColor(colors.tableBorder);
      pdf.setLineWidth(0.5);
      pdf.rect(20, barY, barWidth, barHeight, 'S');
      
      // Draw success portion with solid color
      pdf.setFillColor('#22c55e');
      pdf.rect(20, barY, successWidth, barHeight, 'F');
      
      // Draw failure portion with solid color
      pdf.setFillColor('#ef4444');
      pdf.rect(20 + successWidth, barY, barWidth - successWidth, barHeight, 'F');
      
      // Add labels to the bars
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text(`Success: ${successful} (${successRate}%)`, 25, barY + 13);
      pdf.text(`Failed: ${failed}`, 20 + successWidth + 5, barY + 13);
      
      // Footer with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 1`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // ----- Executive Summary Page -----
      pdf.addPage();
      
      // Header with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(colors.headerText);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("Executive Summary", 20, 15);
      
      // Add a subtle card background
      pdf.setFillColor('#f8fafc');
      pdf.rect(15, 25, pageWidth - 30, 50, 'F');
      
      pdf.setTextColor(colors.dark);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Operation Overview", 20, 35);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`This report summarizes the reconnaissance operation "${data.name}" conducted from `, 20, 45);
      pdf.text(`${formatDate(data.start)} to ${formatDate(data.finish)}.`, 20, 53);
      pdf.text(`A total of ${data.host_group.length} hosts were compromised and ${totalCommands} commands were executed.`, 20, 61);
      
      // Commands Visualization section
      const cmdVisualsY = 85;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text("Command Execution Analysis", 20, cmdVisualsY);
      
      // Add a modern card background
      pdf.setFillColor('#ffffff');
      pdf.setDrawColor(colors.tableBorder);
      pdf.setLineWidth(0.5);
      pdf.rect(15, cmdVisualsY + 5, pageWidth - 30, 70, 'FD');
      
      // Command success/failure stats with modern styling
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text("Success vs. Failure", 20, cmdVisualsY + 20);
      
      // Create bar charts for success/failure with solid colors
      const metricY = cmdVisualsY + 30;
      
      // Draw success metric
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text("Successful", 25, metricY);
      
      const maxBarWidth = 100;
      const barH = 8;
      
      pdf.setFillColor('#f9f9f9');
      pdf.rect(80, metricY - 6, maxBarWidth, barH, 'F');
      
      pdf.setFillColor(colors.success);
      pdf.rect(80, metricY - 6, (successful / totalCommands) * maxBarWidth, barH, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${successful}`, 185, metricY);
      
      // Draw failed metric
      pdf.setFont('helvetica', 'normal');
      pdf.text("Failed", 25, metricY + 15);
      
      pdf.setFillColor('#f9f9f9');
      pdf.rect(80, metricY + 9, maxBarWidth, barH, 'F');
      
      pdf.setFillColor(colors.danger);
      pdf.rect(80, metricY + 9, (failed / totalCommands) * maxBarWidth, barH, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${failed}`, 185, metricY + 15);
      
      // Add pie chart for platforms - simplified without sector method
      const platforms = getPlatformCounts();
      pdf.setFont('helvetica', 'bold');
      pdf.text("Platforms Distribution", 20, metricY + 40);
      
      // Instead of pie chart, draw a bar chart for platforms
      const platformColors = {
        'Windows': colors.primary,
        'Linux': colors.secondary,
        'Darwin': colors.warning,
        'other': colors.info
      };
      
      // Add platform legend with modern styling
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      const legendX = 60;
      const legendY = metricY + 50;
      
      let legendYPos = legendY;
      Object.entries(platforms).forEach(([platform, count], idx) => {
        const y = legendYPos;
        legendYPos += 10;
        
        const platformColor = platformColors[platform as keyof typeof platformColors] || colors.info;
        
        pdf.setFillColor(platformColor);
        pdf.rect(legendX, y - 4, 8, 8, 'F');
        
        pdf.setTextColor(colors.dark);
        pdf.text(`${platform} (${count})`, legendX + 12, y);
        
        // Draw a horizontal bar for each platform
        const platformBarWidth = 60;
        const platformBarHeight = 6;
        const totalPlatforms = Object.values(platforms).reduce((sum, val) => sum + val, 0);
        const platformBarLength = (count / totalPlatforms) * platformBarWidth;
        
        pdf.setFillColor('#f1f5f9');
        pdf.rect(150, y - 4, platformBarWidth, platformBarHeight, 'F');
        
        pdf.setFillColor(platformColor);
        pdf.rect(150, y - 4, platformBarLength, platformBarHeight, 'F');
      });
      
      // Tactics section
      const tacticsY = 170;
      
      pdf.setFillColor('#ffffff');
      pdf.setDrawColor(colors.tableBorder);
      pdf.rect(15, tacticsY, pageWidth - 30, 80, 'FD');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text("Tactics Distribution", 20, tacticsY + 15);
      
      // Get tactics data
      const tactics = getTacticStats();
      const tacticsTotal = Object.values(tactics).reduce((sum, count) => sum + count, 0);
      
      // Draw horizontal bar chart for tactics
      const tacticColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.info];
      
      const tacticsBarWidth = 120;
      const tacticsBarHeight = 8;
      const tacticsBarX = 70;
      let tacticsBarY = tacticsY + 30;
      
      // Sort tactics by count
      const sortedTactics = Object.entries(tactics)
        .sort(([, countA], [, countB]) => countB - countA);
      
      sortedTactics.slice(0, 5).forEach(([tactic, count], index) => {
        const y = tacticsBarY + index * 15;
        
        // Tactic label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(colors.dark);
        
        // Truncate long tactic names
        const displayTactic = tactic.length > 15 ? tactic.substring(0, 13) + '...' : tactic;
        pdf.text(displayTactic, 20, y + 4);
        
        // Empty bar background
        pdf.setFillColor('#f1f5f9');
        pdf.rect(tacticsBarX, y, tacticsBarWidth, tacticsBarHeight, 'F');
        
        // Filled bar with solid color
        const fillWidth = (count / tacticsTotal) * tacticsBarWidth;
        pdf.setFillColor(tacticColors[index % tacticColors.length]);
        pdf.rect(tacticsBarX, y, fillWidth, tacticsBarHeight, 'F');
        
        // Count and percentage
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${count} (${Math.round((count / tacticsTotal) * 100)}%)`, tacticsBarX + tacticsBarWidth + 5, y + 4);
      });
      
      // Footer with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 2`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // ----- Host Details Page -----
      pdf.addPage();
      
      // Header with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(colors.headerText);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("Compromised Hosts", 20, 15);
      
      // Add modern table for hosts
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
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          cellPadding: 4,
          lineWidth: 0.1,
          lineColor: [255, 255, 255]
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [203, 213, 225],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
        }
      });
      
      // Commands Per Host visualization
      const tableHeight = hostTableData.length * 11 + 30;
      const hostChartsY = Math.min(tableHeight + 20, 140);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(colors.dark);
      pdf.text("Commands Per Host", 20, hostChartsY);
      
      // Add modern card background
      pdf.setFillColor('#ffffff');
      pdf.setDrawColor(colors.tableBorder);
      pdf.rect(15, hostChartsY + 5, pageWidth - 30, 130, 'FD');
      
      // Horizontal bar chart for commands per host with solid colors
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      const hostCounts = getHostCommandCounts();
      const hostBarHeight = 10;
      const hostGap = 5;
      const hostStartY = hostChartsY + 20;
      const hostBarMaxWidth = 120;
      
      // Find the maximum value for scaling
      const maxHostCommands = Math.max(...Object.values(hostCounts), 1);
      
      // Sort hosts by command count
      const sortedHosts = Object.entries(hostCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 8); // Limit to top 8 hosts
      
      sortedHosts.forEach(([host, count], idx) => {
        const y = hostStartY + idx * (hostBarHeight + hostGap);
        
        // Host label - truncate if too long
        const displayHost = host.length > 15 ? host.substring(0, 13) + '...' : host;
        pdf.setTextColor(colors.dark);
        pdf.text(displayHost, 20, y + hostBarHeight / 2 + 2);
        
        // Empty bar background
        pdf.setFillColor('#f1f5f9');
        pdf.rect(70, y, hostBarMaxWidth, hostBarHeight, 'F');
        
        // Solid bar fill
        const width = (count / maxHostCommands) * hostBarMaxWidth;
        pdf.setFillColor(59 + idx * 5, 130 - idx * 5, 246);
        pdf.rect(70, y, width, hostBarHeight, 'F');
        
        // Count label
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${count}`, 70 + width + 5, y + hostBarHeight / 2 + 2);
      });
      
      // Platform Performance Section
      const platformY = hostChartsY + 120;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text("Command Success Rate by Platform", 20, platformY);
      
      // Add modern card background
      pdf.setFillColor('#ffffff');
      pdf.setDrawColor(colors.tableBorder);
      pdf.rect(15, platformY + 5, pageWidth - 30, 70, 'FD');
      
      // Command execution by platform stats with modern styling
      const platformStats = getCommandsByPlatform();
      const platformKeys = Object.keys(platformStats);
      
      const platformBarY = platformY + 20;
      const platformBarHeight = 14;
      const platformBarGap = 8;
      const platformBarMaxWidth = 120;
      
      platformKeys.forEach((platform, idx) => {
        const y = platformBarY + idx * (platformBarHeight + platformBarGap);
        const stats = platformStats[platform];
        const total = stats.successful + stats.failed;
        const successRate = Math.round((stats.successful / total) * 100);
        
        // Platform label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(colors.dark);
        pdf.text(platform, 20, y + platformBarHeight / 2 + 2);
        
        // Success rate text
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(successRate > 80 ? colors.success : successRate > 50 ? colors.warning : colors.danger);
        pdf.text(`${successRate}%`, 200, y + platformBarHeight / 2 + 2);
        pdf.setTextColor(colors.dark);
        
        // Background bar
        pdf.setFillColor('#f1f5f9');
        pdf.rect(70, y, platformBarMaxWidth, platformBarHeight, 'F');
        
        // Success portion with solid color
        const successWidth = (stats.successful / total) * platformBarMaxWidth;
        pdf.setFillColor('#22c55e');
        pdf.rect(70, y, successWidth, platformBarHeight, 'F');
        
        // Failure portion with solid color
        const failureWidth = platformBarMaxWidth - successWidth;
        pdf.setFillColor('#ef4444');
        pdf.rect(70 + successWidth, y, failureWidth, platformBarHeight, 'F');
      });
      
      // Footer with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 3`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // ----- Tactics and Techniques Page -----
      pdf.addPage();
      
      // Header with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(colors.headerText);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("MITRE ATT&CK Tactics & Techniques", 20, 15);
      
      // Add modern card background
      pdf.setFillColor('#ffffff');
      pdf.setDrawColor(colors.tableBorder);
      pdf.rect(15, 25, pageWidth - 30, 190, 'FD');
      
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
      
      // Create a modern table for techniques
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
        startY: 35,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          cellPadding: 4
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [203, 213, 225],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 90 },
          2: { halign: 'center', cellWidth: 20 }
        }
      });
      
      // Footer with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 4`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // ----- Command Execution Timeline -----
      pdf.addPage();
      
      // Header with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 20, 'F');
      pdf.setTextColor(colors.headerText);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text("Command Execution Timeline", 20, 15);
      
      // Add modern card background
      pdf.setFillColor('#ffffff');
      pdf.setDrawColor(colors.tableBorder);
      pdf.rect(15, 25, pageWidth - 30, pdf.internal.pageSize.getHeight() - 55, 'FD');
      
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
        startY: 35,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          cellPadding: 4
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [203, 213, 225],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 60 },
          4: { cellWidth: 20 }
        },
        didParseCell: (data) => {
          // Color-code status column
          if (data.column.index === 4) {
            if (data.cell.text[0] === 'Success') {
              data.cell.styles.textColor = colors.success;
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.text[0] === 'Failed') {
              data.cell.styles.textColor = colors.danger;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
      
      // Footer with solid color
      pdf.setFillColor(colors.headerBg);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 20, pageWidth, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(`CONFIDENTIAL - Reconnaissance Report - Page 5`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
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
      className="flex items-center gap-2 bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm"
    >
      <Download className="h-4 w-4" />
      Export Professional Report
    </Button>
  );
};

export default ExportPDF;
