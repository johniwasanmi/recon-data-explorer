
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { ReconData } from '../types/reconTypes';
import { formatDate } from '../utils/dateUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportPDFProps {
  data: ReconData;
}

const ExportPDF: React.FC<ExportPDFProps> = ({ data }) => {
  const generatePDF = async () => {
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your report...",
    });

    try {
      const mainElement = document.querySelector('main');
      if (!mainElement) {
        throw new Error('Cannot find main content element');
      }

      const canvas = await html2canvas(mainElement, {
        scale: 1,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add title and metadata
      pdf.setFontSize(22);
      pdf.text(`Recon Report: ${data.name}`, 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Generated: ${formatDate(new Date().toISOString())}`, 20, 30);
      pdf.text(`Operation Start: ${formatDate(data.start)}`, 20, 38);
      pdf.text(`Operation End: ${formatDate(data.finish)}`, 20, 46);
      
      // Add summary info
      pdf.setFontSize(16);
      pdf.text('Summary', 20, 60);
      
      pdf.setFontSize(12);
      pdf.text(`Total Hosts: ${data.host_group.length}`, 20, 70);
      
      const totalCommands = Object.values(data.steps).reduce(
        (acc, hostSteps) => acc + hostSteps.steps.length, 0
      );
      pdf.text(`Total Commands: ${totalCommands}`, 20, 78);
      
      // Add image of the dashboard
      const imgWidth = pdf.internal.pageSize.getWidth() - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addPage();
      pdf.text('Full Dashboard Capture', 20, 20);
      pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);

      // Save the PDF
      pdf.save(`recon-report-${data.name}-${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({
        title: "PDF Generated Successfully",
        description: "Your report has been downloaded",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error Generating PDF",
        description: "There was an error creating your report. Please try again.",
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
      Export PDF Report
    </Button>
  );
};

export default ExportPDF;
