import React from 'react';
import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Mock Next.js and NextAuth hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/');
  });

  it('renders the Sidebar logo text', () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Sidebar />);
    expect(screen.getByText('CarbonSense')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Food Tracking')).toBeInTheDocument();
  });

  it('shows sign in button when unauthenticated', () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows user info and sign out button when authenticated', () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });
    render(<Sidebar />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
