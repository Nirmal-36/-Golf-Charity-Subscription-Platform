import { useState, useCallback } from 'react';
import api from '../api/axios';

export const useScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveScores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/scores/');
      setScores(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addScore = async (score) => {
    setLoading(true);
    try {
      await api.post('/api/scores/add/', { score });
      await fetchActiveScores(); // Refresh the active window
      return true;
    } catch (err) {
      setError(err.response?.data || 'Failed to submit score');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { scores, loading, error, fetchActiveScores, addScore };
};
