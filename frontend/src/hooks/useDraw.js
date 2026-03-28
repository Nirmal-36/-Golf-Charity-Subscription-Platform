import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useDraw = () => {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentDraw = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/draws/current/');
      setCurrentDraw(data);
      setError(null);
    } catch (err) {
      setError('Failed to load current draw details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/draws/my-history/');
      setHistory(data);
      setError(null);
    } catch (err) {
      setError('Failed to load draw history.');
    } finally {
      setLoading(false);
    }
  };

  const enterDraw = async (drawId, numbers) => {
    try {
      await api.post('/api/draws/enter/', {
        draw_id: drawId,
        numbers: numbers
      });
      // Refresh current draw immediately so UI updates to "entered"
      await fetchCurrentDraw();
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || 
                  err.response?.data?.numbers?.[0] || 
                  'Failed to enter draw.';
      return { success: false, error: msg };
    }
  };

  return {
    currentDraw,
    history,
    loading,
    error,
    fetchCurrentDraw,
    fetchHistory,
    enterDraw
  };
};
