import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';

describe('App routes', () => {
  it('redirects unknown routes to the landing page', async () => {
    render(
      <MemoryRouter initialEntries={['/missing-route']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Secure Agentic AI Governance Platform')).toBeInTheDocument();
  });
});
