
import React, { useState } from 'react';
import { Steps } from '../types/reconTypes';
import { formatDate } from '../utils/dateUtils';
import { CheckCircle, XCircle, Terminal, AlertTriangle, ChevronDown, ChevronUp, Clipboard, ClipboardCheck, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

interface CommandsListProps {
  steps: Steps;
}

const CommandsList: React.FC<CommandsListProps> = ({ steps }) => {
  const { toast } = useToast();
  const [expandedCommands, setExpandedCommands] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedHosts, setCollapsedHosts] = useState<Record<string, boolean>>({});

  const toggleCommand = (id: string) => {
    setExpandedCommands(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleHost = (paw: string) => {
    setCollapsedHosts(prev => ({
      ...prev,
      [paw]: !prev[paw]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Command copied to clipboard",
      description: "The command has been copied to your clipboard",
      duration: 3000,
    });
  };

  // Filter hosts and commands based on search term
  const filteredHosts = Object.entries(steps).filter(([paw, hostSteps]) => {
    const hostMatches = paw.toLowerCase().includes(searchTerm.toLowerCase());
    
    const commandMatches = hostSteps.steps.some(step => 
      step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.plaintext_command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.attack.tactic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.attack.technique_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.attack.technique_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return hostMatches || commandMatches;
  });

  // Get total number of hosts and commands
  const totalHosts = Object.keys(steps).length;
  const totalCommands = Object.values(steps).reduce(
    (acc, hostSteps) => acc + hostSteps.steps.length, 0
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Terminal className="mr-2 h-6 w-6 text-primary" />
        Command Execution History
      </h2>
      
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commands, hosts, or techniques..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <p className="text-sm text-muted-foreground">
          Showing {filteredHosts.length} of {totalHosts} hosts and up to {totalCommands} commands
        </p>
      </div>
      
      <div className="space-y-4">
        {filteredHosts.length === 0 ? (
          <div className="bg-card rounded-lg border shadow p-6 text-center">
            <p className="text-muted-foreground">No commands matching your search criteria</p>
          </div>
        ) : (
          filteredHosts.map(([paw, hostSteps]) => {
            const isHostCollapsed = collapsedHosts[paw] || false;
            
            return (
              <div key={paw} className="bg-card rounded-lg border shadow overflow-hidden">
                <div 
                  className="p-4 border-b border-border cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleHost(paw)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{paw}</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-3">
                        {hostSteps.steps.length} commands
                      </span>
                      {isHostCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
                
                {!isHostCollapsed && (
                  <div className="divide-y divide-border">
                    {hostSteps.steps
                      .filter(step => 
                        searchTerm === '' ||
                        step.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        step.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        step.plaintext_command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        step.attack.tactic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        step.attack.technique_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        step.attack.technique_id.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((step) => {
                        const isExpanded = expandedCommands[step.link_id] || false;
                        const isSuccess = step.status === 0;
                        
                        return (
                          <div key={step.link_id} className="animate-fade-in">
                            <div 
                              className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                              onClick={() => toggleCommand(step.link_id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {isSuccess ? (
                                    <CheckCircle className="h-5 w-5 text-success" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-danger" />
                                  )}
                                  <div>
                                    <p className="font-medium">{step.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(step.run)} • {step.platform} • {step.executor}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div 
                                    className="p-2 rounded-full hover:bg-secondary mr-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(step.plaintext_command);
                                    }}
                                    title="Copy command"
                                  >
                                    <Clipboard className="h-4 w-4" />
                                  </div>
                                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="p-4 bg-secondary/10 border-t border-border animate-fade-in">
                                <div className="mb-4">
                                  <p className="text-sm font-medium mb-1">Description</p>
                                  <p className="text-sm">{step.description}</p>
                                </div>
                                
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium">Command</p>
                                    <button 
                                      className="text-xs flex items-center text-primary hover:text-primary/80"
                                      onClick={() => copyToClipboard(step.plaintext_command)}
                                    >
                                      <ClipboardCheck className="h-3 w-3 mr-1" />
                                      Copy
                                    </button>
                                  </div>
                                  <div className="terminal-code">
                                    <code className="command">{step.plaintext_command}</code>
                                  </div>
                                </div>
                                
                                {step.output && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Output</p>
                                    <div className="terminal-code">
                                      {step.output.stdout && <div className="output mb-2">{step.output.stdout}</div>}
                                      {step.output.stderr && <div className="error">{step.output.stderr}</div>}
                                      {step.output.exit_code && (
                                        <div className={`mt-2 ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                                          Exit Code: {step.output.exit_code}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="mt-4 bg-card rounded-md p-3">
                                  <div className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 text-warning mr-2" />
                                    <p className="text-sm font-medium">MITRE ATT&CK</p>
                                  </div>
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div className="flex items-center">
                                      <span className="text-xs text-muted-foreground mr-2">Tactic:</span>
                                      <span className="technique-badge bg-attack-tactic text-white">
                                        {step.attack.tactic}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="text-xs text-muted-foreground mr-2">Technique:</span>
                                      <span className="technique-badge bg-attack-technique text-white">
                                        {step.attack.technique_id} - {step.attack.technique_name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommandsList;
