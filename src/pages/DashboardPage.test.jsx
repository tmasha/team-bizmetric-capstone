import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import DashboardPage from './DashboardPage';

const { apiFetch } = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock('../lib/api', () => ({
  apiFetch,
}));

vi.mock('recharts', () => {
  const passthrough = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: passthrough,
    AreaChart: passthrough,
    CartesianGrid: () => null,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    PieChart: passthrough,
    Pie: passthrough,
    Cell: () => null,
    LineChart: passthrough,
    Line: () => null,
  };
});

describe('DashboardPage', () => {
  it('loads dashboard telemetry and refreshes when the window changes', async () => {
    apiFetch
      .mockResolvedValueOnce({
        summaryCards: [
          { label: 'Active Sessions', value: '3', detail: 'Sessions active in window', tone: 'blue' },
          { label: 'Policy Compliance', value: '95.0%', detail: 'Allowed or successful outcomes', tone: 'green' },
          { label: 'Threats Blocked', value: '1', detail: 'Blocked during selected window', tone: 'red' },
          { label: 'Audit Events', value: '10', detail: 'Captured backend and policy events', tone: 'violet' },
        ],
        authenticationActivity: [{ time: '09:00', successful: 2, failed: 0 }],
        policyEnforcement: [
          { name: 'Allowed', value: 9, color: '#22c55e' },
          { name: 'Blocked', value: 1, color: '#dc2626' },
          { name: 'Review Required', value: 0, color: '#f97316' },
        ],
        threatTimeline: [{ hour: '09:00', threats: 1 }],
        recentAuditLogs: [
          {
            timestamp: '2026-01-01T09:00:00Z',
            user: 'user@bizmetric.local',
            action: 'Prompt Injection',
            status: 'blocked',
            details: 'Prompt injection marker detected.',
            requestId: 'req-1',
          },
        ],
        criticalAlert: {
          title: 'Prompt Injection',
          timestamp: '2026-01-01T09:00:00Z',
          user: 'user@bizmetric.local',
          message: 'Prompt injection marker detected.',
        },
      })
      .mockResolvedValueOnce({
        summaryCards: [
          { label: 'Active Sessions', value: '7', detail: 'Sessions active in window', tone: 'blue' },
          { label: 'Policy Compliance', value: '99.0%', detail: 'Allowed or successful outcomes', tone: 'green' },
          { label: 'Threats Blocked', value: '2', detail: 'Blocked during selected window', tone: 'red' },
          { label: 'Audit Events', value: '22', detail: 'Captured backend and policy events', tone: 'violet' },
        ],
        authenticationActivity: [{ time: '10:00', successful: 4, failed: 1 }],
        policyEnforcement: [],
        threatTimeline: [],
        recentAuditLogs: [],
        criticalAlert: null,
      });

    render(<DashboardPage />);

    expect(screen.getByText(/Loading backend telemetry/i)).toBeInTheDocument();
    await screen.findByText(/the request from/i);
    expect(apiFetch).toHaveBeenCalledWith('/api/dashboard/metrics?window=24h');

    await userEvent.selectOptions(screen.getByRole('combobox'), '7d');

    await waitFor(() =>
      expect(apiFetch).toHaveBeenLastCalledWith('/api/dashboard/metrics?window=7d')
    );
    await screen.findByText('No Critical Alerts');
  });

  it('shows a dashboard load error when telemetry fetch fails', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Telemetry unavailable.'));

    render(<DashboardPage />);

    await screen.findByText('Dashboard Load Error');
    expect(screen.getByText('Telemetry unavailable.')).toBeInTheDocument();
  });
});
