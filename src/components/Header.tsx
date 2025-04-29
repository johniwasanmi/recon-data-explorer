
import React from 'react';
import { Bell, Shield, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Recon Data Explorer</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-secondary">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span>A</span>
              </div>
              <span className="hidden md:inline-block">Admin</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
