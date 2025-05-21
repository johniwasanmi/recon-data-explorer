
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Mail, AlertCircle, LogIn, UserPlus, ArrowLeft } from 'lucide-react';

enum AuthView {
  SIGN_IN = 'signin',
  SIGN_UP = 'signup',
  FORGOT_PASSWORD = 'forgot',
  CHECK_EMAIL = 'check',
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, signInWithGoogle, resetPassword, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "You've successfully signed in.",
      });
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      toast({
        title: "Sign up error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setView(AuthView.CHECK_EMAIL);
    }
    
    setIsSubmitting(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Reset error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setView(AuthView.CHECK_EMAIL);
    }
    
    setIsSubmitting(false);
  };

  const renderView = () => {
    switch (view) {
      case AuthView.SIGN_IN:
        return (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  type="button"
                  className="px-0 text-xs"
                  onClick={() => setView(AuthView.FORGOT_PASSWORD)}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => signInWithGoogle()}
              disabled={isSubmitting}
            >
              <svg viewBox="0 0 48 48" className="mr-2 h-5 w-5">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>
        );
      
      case AuthView.SIGN_UP:
        return (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => signInWithGoogle()}
              disabled={isSubmitting}
            >
              <svg viewBox="0 0 48 48" className="mr-2 h-5 w-5">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign up with Google
            </Button>
          </form>
        );
        
      case AuthView.FORGOT_PASSWORD:
        return (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="flex items-center p-4 text-sm text-blue-800 rounded-lg bg-blue-50">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>
                Enter your email address and we'll send you a link to reset your password
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-xs"
                onClick={() => setView(AuthView.SIGN_IN)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </div>
          </form>
        );
        
      case AuthView.CHECK_EMAIL:
        return (
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent you a link to {email}. Please check your inbox and follow the instructions.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-4"
              onClick={() => setView(AuthView.SIGN_IN)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col items-center space-y-2 text-center mb-6">
          <h1 className="text-3xl font-bold">Caldera Recon Explorer</h1>
          <p className="text-muted-foreground">
            Visualize and analyze your recon data from Caldera operations
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            {view !== AuthView.CHECK_EMAIL && view !== AuthView.FORGOT_PASSWORD && (
              <Tabs defaultValue={view} onValueChange={(v) => setView(v as AuthView)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value={AuthView.SIGN_IN}>Sign In</TabsTrigger>
                  <TabsTrigger value={AuthView.SIGN_UP}>Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            {view === AuthView.FORGOT_PASSWORD && (
              <CardTitle>Reset your password</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {renderView()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
