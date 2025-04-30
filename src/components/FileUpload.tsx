
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import { ReconData } from '../types/reconTypes';

interface FileUploadProps {
  onDataLoad: (data: ReconData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Basic validation to ensure it's a recon data format
        if (!jsonData.host_group || !jsonData.steps) {
          throw new Error('Invalid recon data format');
        }
        
        // Ensure proper structure for any string outputs
        // Convert any string outputs to proper format
        Object.keys(jsonData.steps).forEach(paw => {
          jsonData.steps[paw].steps.forEach((step: any) => {
            if (step.output && typeof step.output === 'string') {
              try {
                step.output = JSON.parse(step.output);
              } catch {
                // If it's not valid JSON, create a structured object with the string as stdout
                step.output = {
                  stdout: step.output,
                  stderr: '',
                  exit_code: '0'
                };
              }
            } else if (step.output === null || step.output === undefined) {
              // Initialize empty output object if not present
              step.output = {
                stdout: '',
                stderr: '',
                exit_code: '0'
              };
            }
          });
        });
        
        onDataLoad(jsonData);
        toast({
          title: "Data loaded successfully",
          description: `Loaded data for operation: ${jsonData.name || 'Unnamed'}`,
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast({
          title: "Error loading data",
          description: "The file is not a valid recon data JSON",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
        data-testid="file-upload"
      />
      <Button 
        variant="outline" 
        onClick={triggerFileInput}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Upload Recon Data
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Upload a JSON file containing reconnaissance data
      </p>
    </div>
  );
};

export default FileUpload;
