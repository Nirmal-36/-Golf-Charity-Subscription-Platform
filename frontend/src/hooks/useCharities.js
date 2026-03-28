import { useState, useCallback } from 'react';
import api from '../api/axios';

export const useCharities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCharities = useCallback(async (category = null) => {
    setLoading(true);
    try {
      const url = category ? `/api/charities/?category=${category}` : '/api/charities/';
      const { data } = await api.get(url);
      setCharities(data);
      setError(null);
    } catch {
      setError('Failed to load charities');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCharity = async (charityId) => {
    try {
      await api.post('/api/charities/select/', { charity_id: charityId });
      return true;
    } catch {
      setError('Failed to select charity');
      return false;
    }
  };

  const updateDonationPercentage = async (percentage) => {
    try {
      await api.post('/api/charities/donation-pct/', { percentage });
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update percentage');
      return false;
    }
  };

  return { charities, loading, error, fetchCharities, selectCharity, updateDonationPercentage };
};
