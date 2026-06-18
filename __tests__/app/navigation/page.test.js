import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from '@/app/navigation/page';

// Mock google maps components and hooks
jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  DirectionsRenderer: () => <div data-testid="directions-renderer"></div>,
  Autocomplete: ({ children }) => <div data-testid="autocomplete">{children}</div>,
}));

describe('Navigation Page', () => {
  it('renders header correctly', () => {
    render(<Navigation />);
    expect(screen.getByText('Carbon-Aware Navigation')).toBeInTheDocument();
  });

  it('renders input fields for Source and Destination', () => {
    render(<Navigation />);
    expect(screen.getByPlaceholderText('e.g. Home')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Office')).toBeInTheDocument();
  });

  it('renders Calculate Routes button', () => {
    render(<Navigation />);
    expect(screen.getByRole('button', { name: /Calculate Routes/i })).toBeInTheDocument();
  });

  it('renders the mocked map container', () => {
    render(<Navigation />);
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });
});
