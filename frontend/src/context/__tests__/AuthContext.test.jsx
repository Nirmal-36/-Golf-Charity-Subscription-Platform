import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, AuthContext } from '../AuthContext';
import api from '../../api/axios';
import React, { useContext } from 'react';

// Mock axios
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } }
  }
}));

// Test component to consume context
const TestComponent = () => {
  const { user, login, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'no user'}</div>
      <button onClick={() => login('test', 'pass')}>Login</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initially has no user and is not loading if no token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('no user');
  });

  it('attempts to fetch user if access_token exists in localStorage', async () => {
    localStorage.setItem('access_token', 'fake-token');
    api.get.mockResolvedValueOnce({ data: { username: 'testuser' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
    expect(api.get).toHaveBeenCalledWith('/api/auth/me/');
  });

  it('updates state on successful login', async () => {
    const mockUser = { username: 'newuser' };
    api.post.mockResolvedValueOnce({ data: { access: 'new-token', refresh: 'ref-token', user: mockUser } });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Login');
    loginBtn.click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('newuser');
    });
    expect(localStorage.getItem('access_token')).toBe('new-token');
  });
});
