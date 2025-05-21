
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Check, ArrowRight, LineChart, Lock, Server } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between py-6 px-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Recon Data Explorer</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-b from-background to-background/95">
        {/* Hero section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div
                className="space-y-6 animate-fade-in"
              >
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                  Secure Reconnaissance Analytics
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Advanced <span className="text-primary">Recon Data</span> Visualization Tool
                </h1>
                <p className="text-lg text-muted-foreground">
                  Explore, analyze and visualize security reconnaissance data with our powerful and intuitive platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Demo login
                    </Button>
                  </Link>
                </div>
                <div className="pt-4">
                  <div className="flex items-center gap-8">
                    {['Real-time analytics', 'Secure platform', 'Interactive reports'].map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 text-primary mr-1" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className="relative animate-fade-in"
              >
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-1">
                  <div className="bg-card rounded-xl shadow-xl overflow-hidden border border-border">
                    <img 
                      src="https://static.wixstatic.com/media/a7f3a2_ef354985b92d4092b0c56935a9563993~mv2.png" 
                      alt="Dashboard Preview"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="absolute -z-10 top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-primary/20 blur-3xl rounded-full opacity-20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform provides comprehensive tools for security reconnaissance data analysis.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                >
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary/80 to-accent/80 rounded-2xl p-10 lg:p-20 text-white text-center">
              <h2 
                className="text-3xl lg:text-4xl font-bold mb-6 animate-fade-in"
              >
                Ready to explore your reconnaissance data?
              </h2>
              <p 
                className="text-lg mb-10 max-w-2xl mx-auto opacity-90 animate-fade-in"
              >
                Sign up today and start visualizing your security reconnaissance data more effectively.
              </p>
              <div
                className="animate-fade-in"
              >
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                    Get started now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Recon Data Explorer</h2>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Recon Data Explorer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: LineChart,
    title: "Interactive Dashboards",
    description: "Visualize reconnaissance data with intuitive and interactive dashboards for better analysis and insights."
  },
  {
    icon: Lock,
    title: "Security Analysis",
    description: "Analyze security reconnaissance data to identify vulnerabilities and potential threats."
  },
  {
    icon: Server,
    title: "Host Monitoring",
    description: "Monitor compromised hosts and track their activities with detailed visualization tools."
  },
  {
    icon: Shield,
    title: "Tactical Analysis",
    description: "Examine tactics, techniques, and procedures used during reconnaissance operations."
  },
  {
    icon: LineChart,
    title: "Timeline Visualization",
    description: "Visualize the timeline of events during reconnaissance operations for better understanding."
  },
  {
    icon: Lock,
    title: "Secure Reporting",
    description: "Generate and export secure reports for your reconnaissance operations."
  }
];

export default Landing;
