import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '@/app/login/page';
import { signIn } from 'next-auth/react';

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('Login Page', () => {
  it('renders the login card', () => {
    render(<Login />);
    expect(screen.getByText('CarbonSense')).toBeInTheDocument();
    expect(screen.getByText(/Sign in to access your Digital Twin/i)).toBeInTheDocument();
  });

  it('renders the Google sign-in button', () => {
    render(<Login />);
    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(button).toBeInTheDocument();
  });

  it('calls signIn when the Google button is clicked', () => {
    render(<Login />);
    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    fireEvent.click(button);
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });
});
