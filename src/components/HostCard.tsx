
import React, { useState } from 'react';
import { HostGroup } from '../types/reconTypes';
import { formatDate, timeAgo } from '../utils/dateUtils';
import { Server, ChevronDown, ChevronUp, Shield, Clock, Activity, User } from 'lucide-react';

interface HostCardProps {
  host: HostGroup;
}

const HostCard: React.FC<HostCardProps> = ({ host }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`host-card rounded-lg overflow-hidden ${host.trusted ? 'trusted' : 'untrusted'} animate-fade-in`}>
      <div 
        className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Server className={`mr-3 h-5 w-5 ${host.trusted ? 'text-success' : 'text-warning'}`} />
            <div>
              <h3 className="font-semibold">{host.display_name}</h3>
              <p className="text-sm text-muted-foreground">{host.platform} • {host.architecture}</p>
            </div>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 text-xs rounded-full mr-2 ${host.trusted ? 'bg-success bg-opacity-20 text-success' : 'bg-warning bg-opacity-20 text-warning'}`}>
              {host.trusted ? 'Trusted' : 'Untrusted'}
            </span>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-border bg-secondary/10 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Host Information</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center text-sm">
                  <Server className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Host:</span>
                  <span>{host.host}</span>
                </li>
                <li className="flex items-center text-sm">
                  <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Privilege:</span>
                  <span className={host.privilege === 'Elevated' ? 'text-success' : 'text-muted-foreground'}>
                    {host.privilege}
                  </span>
                </li>
                <li className="flex flex-wrap items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Username:</span>
                  <span>{host.username}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <p className="text-sm font-medium">Connection Details</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center text-sm">
                  <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Status:</span>
                  <span className="text-success">Active</span>
                </li>
                <li className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Created:</span>
                  <span title={formatDate(host.created)}>{timeAgo(host.created)}</span>
                </li>
                <li className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Last seen:</span>
                  <span title={formatDate(host.last_seen)}>{timeAgo(host.last_seen)}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">IP Addresses</p>
            <div className="flex flex-wrap gap-2">
              {host.host_ip_addrs.map((ip, index) => (
                <span key={index} className="px-2 py-1 rounded-md bg-secondary text-xs">
                  {ip}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Execution Details</p>
            <div className="bg-terminal p-3 rounded-md text-xs">
              <p><span className="text-primary-foreground">Location:</span> {host.location}</p>
              <p><span className="text-primary-foreground">PID:</span> {host.pid}</p>
              <p><span className="text-primary-foreground">PPID:</span> {host.ppid}</p>
              <p><span className="text-primary-foreground">Executors:</span> {host.executors.join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostCard;
