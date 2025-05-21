
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get the current URL to determine if we're in development or production
      const url = window.location.origin;
      const redirectUrl = new URL('/auth/callback', url).toString();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
      toast({
        title: "Password reset link sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset link",
        description: error.message || "There was a problem sending the reset link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout 
        title="Check your email" 
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-6">
          <motion.div 
            className="flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary/10 rounded-full p-6">
              <Mail className="h-12 w-12 text-primary" />
            </div>
          </motion.div>
          
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and click the link to reset your password.
          </p>
          
          <div className="pt-4">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Return to login
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset password" 
      subtitle="Enter your email to receive a reset link"
    >
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            <span>Email</span>
          </Label>
          <Input 
            id="email"
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-11"
          disabled={loading}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
              />
              Sending reset link...
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="pt-4 text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
