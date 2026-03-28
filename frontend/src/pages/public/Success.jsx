import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, Trophy, Home } from 'lucide-react';

/**
 * Transaction Gateway: Success
 * The post-subscription landing terminal.
 * Orchestrates a strategic delay to allow Stripe webhooks to 
 * synchronize the persistence layer before refreshing the user's 
 * global identity context.
 */
const Success = () => {
  const { checkUser } = useAuth();

  // Lifecycle: Post-transaction identity synchronization
  useEffect(() => {
    /**
     * Infrastructure Sync: checkUser
     * Polls the backend for updated subscription status.
     * Strategic Delay: 2000ms ensures asynchronous webhook completion.
     */
    const timer = setTimeout(async () => {
      await checkUser();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkUser]);

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for subscribing. Your account is now fully active. You can now log your scores and select a charity!
        </p>
        <Link 
          to="/" 
          className="block w-full py-4 bg-brand-green text-white rounded-xl font-bold hover:bg-brand-green/90 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Success;
