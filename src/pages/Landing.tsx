
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, BarChart3, Shield, Activity, PieChart } from 'lucide-react';
// Replace the direct import with a relative path to public assets
// The logo will be served from the public directory
const logoPath = '/caldera-logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-background to-muted/50">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <div className="flex items-center mb-6">
                  <img src={logoPath} alt="Caldera Logo" className="h-12 mr-3" />
                  <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Caldera Recon Explorer
                  </h1>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Visualize and analyze your security operations data
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Upload, analyze, and create beautiful reports from your Caldera reconnaissance operations.
                  Gain actionable insights into your security operations with advanced visualization tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="text-lg"
                    onClick={() => navigate(user ? '/dashboard' : '/auth')}
                  >
                    {user ? 'Go to Dashboard' : 'Get Started'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  {!user && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="text-lg"
                      onClick={() => navigate('/auth')}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 md:pl-12">
                <div className="rounded-xl bg-card border shadow-lg p-6 transform rotate-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-bold">Command Analysis</h3>
                      <p className="text-muted-foreground text-sm">Track executed commands and their impact</p>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-lg">
                      <Shield className="h-8 w-8 text-blue-500 mb-2" />
                      <h3 className="font-bold">Host Monitoring</h3>
                      <p className="text-muted-foreground text-sm">View affected systems and their details</p>
                    </div>
                    <div className="bg-amber-500/10 p-4 rounded-lg">
                      <Activity className="h-8 w-8 text-amber-500 mb-2" />
                      <h3 className="font-bold">Timeline View</h3>
                      <p className="text-muted-foreground text-sm">Chronological operation tracking</p>
                    </div>
                    <div className="bg-green-500/10 p-4 rounded-lg">
                      <PieChart className="h-8 w-8 text-green-500 mb-2" />
                      <h3 className="font-bold">Tactics Summary</h3>
                      <p className="text-muted-foreground text-sm">MITRE ATT&CK framework analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Powerful Features for Security Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Advanced Visualization</h3>
                <p className="text-muted-foreground">
                  Transform complex data into intuitive visualizations. See patterns and trends at a glance.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="bg-blue-500/10 p-4 rounded-full inline-block mb-4">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">MITRE ATT&CK Integration</h3>
                <p className="text-muted-foreground">
                  Map operations to the MITRE ATT&CK framework for comprehensive tactics analysis.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="bg-amber-500/10 p-4 rounded-full inline-block mb-4">
                  <PieChart className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Professional Reports</h3>
                <p className="text-muted-foreground">
                  Generate beautiful, detailed PDF reports that are perfect for presentations and documentation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={logoPath} alt="Caldera Logo" className="h-8 mr-2" />
              <span className="font-bold">Caldera Recon Explorer</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Caldera Recon Explorer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
