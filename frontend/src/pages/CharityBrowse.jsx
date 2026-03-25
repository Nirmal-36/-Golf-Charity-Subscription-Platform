import React, { useEffect } from 'react';
import { useCharities } from '../hooks/useCharities';
import { useAuth } from '../hooks/useAuth';
import CharityCard from '../components/CharityCard';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CharityBrowse = () => {
  const { charities, loading, error, fetchCharities, selectCharity } = useCharities();
  const { user, checkUser } = useAuth();

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const handleSelectCharity = async (charityId) => {
    const success = await selectCharity(charityId);
    if (success) {
      await checkUser(); // Refresh user profile to get the newly selected charity name
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading directory...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-brand-green mb-4 transition">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-brand-green">Charity Directory</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Browse our partnered charities. 10% of your monthly subscription is automatically donated to the charity you select.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities.map((charity) => {
          // Check if this charity is the currently selected one by comparing names
          // (Since user.selected_charity returns the string name according to the UserSerializer)
          const isSelected = user?.selected_charity === charity.id || user?.selected_charity === charity.name;
          
          return (
            <CharityCard 
              key={charity.id}
              charity={charity}
              isSelected={isSelected}
              onSelect={handleSelectCharity}
            />
          );
        })}
      </div>
      
      {charities.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
          No charities available at the moment.
        </div>
      )}
    </div>
  );
};

export default CharityBrowse;
