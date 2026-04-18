import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Cloud,
  CheckCircle2,
  Database,
  FileText,
  Lock,
  RefreshCcw,
  Server,
  Shield,
  Users,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiFetch } from '../lib/api';

const architectureNodes = [
  { label: 'Users', tone: 'gray', icon: Users },
  { label: 'Auth Layer', tone: 'blue', icon: Lock },
  { label: 'Policy Engine', tone: 'green', icon: Shield },
  { label: 'AI Agent', tone: 'violet', icon: Server },
  { label: 'Azure Cloud', tone: 'blue', icon: Cloud },
  { label: 'Audit Database', tone: 'orange', icon: Database },
];

const toneIconMap = {
  blue: Users,
  green: Shield,
  red: XCircle,
  violet: FileText,
};

const fallbackMetrics = {
  summaryCards: [
    { label: 'Active Sessions', value: '0', detail: 'No live data yet', tone: 'blue' },
    { label: 'Policy Compliance', value: '100.0%', detail: 'Waiting for events', tone: 'green' },
    { label: 'Threats Blocked', value: '0', detail: 'Waiting for events', tone: 'red' },
    { label: 'Audit Events', value: '0', detail: 'Waiting for events', tone: 'violet' },
  ],
  authenticationActivity: [{ time: '00:00', successful: 0, failed: 0 }],
  policyEnforcement: [
    { name: 'Allowed', value: 0, color: '#22c55e' },
    { name: 'Blocked', value: 0, color: '#dc2626' },
    { name: 'Review Required', value: 0, color: '#f97316' },
  ],
  threatTimeline: [{ hour: '00:00', threats: 0 }],
  recentAuditLogs: [],
  criticalAlert: null,
};

function useDarkMode() {
  const [dark, setDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

function formatTimestamp(value) {
  if (!value) return 'n/a';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function DashboardPage() {
  const dark = useDarkMode();
  const [windowSize, setWindowSize] = useState('24h');
  const [refreshToken, setRefreshToken] = useState(0);
  const [metricsData, setMetricsData] = useState(fallbackMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMetrics() {
      setLoading(true);
      setError('');
      try {
        const response = await apiFetch(`/api/dashboard/metrics?window=${windowSize}`);
        if (active) {
          setMetricsData({
            ...fallbackMetrics,
            ...response,
          });
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMetrics();

    return () => {
      active = false;
    };
  }, [windowSize, refreshToken]);

  const gridColor = dark ? '#30363d' : '#E5E7EB';
  const axisColor = dark ? '#c9d1d9' : '#6B7280';
  const greenColor = dark ? '#4ade80' : '#22c55e';
  const redColor = dark ? '#f87171' : '#dc2626';
  const tooltipStyle = {
    backgroundColor: dark ? '#1c2230' : '#ffffff',
    border: `1px solid ${gridColor}`,
    color: dark ? '#f0f6fc' : '#111827',
  };
  const tooltipTextStyle = { color: dark ? '#f0f6fc' : '#111827' };
  const legendStyle = { color: axisColor };

  return (
    <div className="page-wrap">
      <section className="dashboard-title-row dashboard-header">
        <div>
          <h1>Security and Compliance Dashboard</h1>
          <p>Real-time monitoring of AI governance controls powered by the Flask control plane.</p>
        </div>
        <div className="dashboard-controls">
          <select className="domain-select compact" value={windowSize} onChange={(event) => setWindowSize(event.target.value)}>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button className="button outline" type="button" onClick={() => setRefreshToken((value) => value + 1)}>
            <RefreshCcw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {error ? (
        <section className="critical-alert">
          <strong>
            <AlertTriangle size={18} />
            Dashboard Load Error
          </strong>
          <p>{error}</p>
        </section>
      ) : metricsData.criticalAlert ? (
        <section className="critical-alert">
          <strong>
            <AlertTriangle size={18} />
            {metricsData.criticalAlert.title}
          </strong>
          <p>
            At {formatTimestamp(metricsData.criticalAlert.timestamp)}, the request from{' '}
            {metricsData.criticalAlert.user} was stopped. {metricsData.criticalAlert.message}
          </p>
        </section>
      ) : (
        <section className="policy-ok">
          <strong>
            <CheckCircle2 size={16} />
            No Critical Alerts
          </strong>
          <span>The backend has not reported any blocked events inside the selected window.</span>
        </section>
      )}

      {loading ? <p className="loading-note">Loading backend telemetry...</p> : null}

      <section className="cards-grid metrics-grid">
        {metricsData.summaryCards.map((metric) => {
          const Icon = toneIconMap[metric.tone] || Activity;
          return (
            <article key={metric.label} className="card metric-card">
              <h3>{metric.label}</h3>
              <div className="metric-main">
                <strong>{metric.value}</strong>
                <span className={`metric-icon ${metric.tone}`}>
                  <Icon size={20} />
                </span>
              </div>
              <p>
                {metric.tone === 'green' && <CheckCircle2 size={14} />}
                {metric.tone === 'red' && <AlertTriangle size={14} />}
                {metric.tone === 'violet' && <Activity size={14} />}
                {metric.detail}
              </p>
            </article>
          );
        })}
      </section>

      <section className="cards-grid charts-grid">
        <article className="card">
          <div className="card-title-row">
            <h3>Authentication Activity</h3>
            <p>Successful and failed authentication attempts</p>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metricsData.authenticationActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="time" stroke={axisColor} tick={{ fill: axisColor }} />
                <YAxis stroke={axisColor} tick={{ fill: axisColor }} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipTextStyle} labelStyle={tooltipTextStyle} />
                <Legend wrapperStyle={legendStyle} />
                <Area type="monotone" dataKey="successful" stroke={greenColor} fill={greenColor} fillOpacity={0.35} name="Successful" />
                <Area type="monotone" dataKey="failed" stroke={redColor} fill={redColor} fillOpacity={0.35} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h3>Policy Enforcement Distribution</h3>
          <div className="chart-shell pie-wrap">
            <ResponsiveContainer width="50%" height={280}>
              <PieChart>
                <Pie
                  data={metricsData.policyEnforcement}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={92}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {metricsData.policyEnforcement.map((entry, index) => (
                    <Cell key={`policy-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipTextStyle} labelStyle={tooltipTextStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="policy-legend">
              {metricsData.policyEnforcement.map((item) => (
                <div key={item.name} className="policy-item">
                  <span className="policy-dot" style={{ backgroundColor: item.color }} />
                  <div>
                    <small>{item.name}</small>
                    <strong>{item.value.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="card">
        <h3>System Architecture</h3>
        <p className="muted">Azure AI Governance Platform infrastructure overview.</p>
        <div className="architecture-flow">
          {architectureNodes.map((node, index) => {
            const Icon = node.icon;

            return (
              <React.Fragment key={node.label}>
                <div className={`arch-node ${node.tone}`}>
                  <Icon size={22} className="arch-icon" />
                  <span>{node.label}</span>
                </div>
                {index < architectureNodes.length - 1 && <span className="arch-arrow">→</span>}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3>Threat Detection Timeline</h3>
        <p className="muted">Security threats detected and blocked over the selected time window.</p>
        <div className="chart-shell threat-row">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metricsData.threatTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="hour" stroke={axisColor} tick={{ fill: axisColor }} />
              <YAxis stroke={axisColor} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Line type="monotone" dataKey="threats" stroke={redColor} strokeWidth={2} name="Threats Blocked" dot={{ fill: redColor, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card table-card">
        <h3>Recent Audit Logs</h3>
        <p className="muted">Comprehensive audit trail of policy decisions, tool calls, and blocked events.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {metricsData.recentAuditLogs.length ? (
                metricsData.recentAuditLogs.map((log, index) => (
                  <tr key={`${log.requestId}-${log.timestamp}-${index}`}>
                    <td>{formatTimestamp(log.timestamp)}</td>
                    <td>{log.user}</td>
                    <td>{log.action}</td>
                    <td>
                      <span
                        className={
                          log.status === 'success' || log.status === 'allowed'
                            ? 'badge success'
                            : log.status === 'review_required'
                              ? 'badge warning'
                              : 'badge danger'
                        }
                      >
                        {log.status}
                      </span>
                    </td>
                    <td>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No audit events captured for the selected time window.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
