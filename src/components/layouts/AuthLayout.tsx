
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-12">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Recon Data Explorer</span>
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div 
          className="w-full max-w-md animate-fade-in"
        >
          <div className="bg-card rounded-xl shadow-xl border border-border/40 backdrop-blur-sm p-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Recon Data Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
