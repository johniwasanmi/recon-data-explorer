
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layouts/AuthLayout';

const VerificationPending = () => {
  return (
    <AuthLayout 
      title="Check your email" 
      subtitle="We've sent you a verification link"
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
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to your email address. 
            Please click the link to verify your account.
          </p>
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder.
          </p>
        </div>
        
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
};

export default VerificationPending;
