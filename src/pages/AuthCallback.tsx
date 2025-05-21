
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import AuthLayout from '@/components/layouts/AuthLayout';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the access token from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // If tokens exist in the URL, set the session
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          toast({
            title: "Authentication successful",
            description: "Your account has been verified.",
          });

          // Redirect to the dashboard
          navigate('/');
        } else {
          // Handle email verification links
          const { error } = await supabase.auth.getSession();
          if (error) {
            throw error;
          }

          // The session is now set, redirect to the dashboard
          navigate('/');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        toast({
          title: "Authentication failed",
          description: err.message || "There was a problem verifying your account.",
          variant: "destructive",
        });

        // Redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <AuthLayout
      title={error ? "Authentication Failed" : "Processing Authentication"}
      subtitle={error ? "We encountered an error" : "Please wait while we verify your account"}
    >
      <div className="flex flex-col items-center justify-center py-8">
        {isLoading ? (
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        ) : error ? (
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground">
              You will be redirected to the login page shortly.
            </p>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
};

export default AuthCallback;
