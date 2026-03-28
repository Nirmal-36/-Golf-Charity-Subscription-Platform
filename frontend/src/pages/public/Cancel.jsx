import React from 'react';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Transaction Gateway: Cancel
 * The fallback terminal for abandoned checkout sessions.
 * Provides a clear path back to the subscription value proposition 
 * without generating abandoned state alerts.
 */
const Cancel = () => {
  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Checkout Canceled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was canceled and you have not been charged.
        </p>
        <Link 
          to="/subscribe" 
          className="block w-full py-4 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition"
        >
          Return to Subscription
        </Link>
      </div>
    </div>
  );
};

export default Cancel;
