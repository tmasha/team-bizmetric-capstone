import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Cloud,
  CheckCircle2,
  Database,
  FileText,
  Lock,
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

const authData = [
  { time: '00:00', successful: 45, failed: 2 },
  { time: '04:00', successful: 38, failed: 1 },
  { time: '08:00', successful: 92, failed: 5 },
  { time: '12:00', successful: 118, failed: 3 },
  { time: '16:00', successful: 95, failed: 8 },
  { time: '20:00', successful: 67, failed: 2 },
];

const metrics = [
  { label: 'Active Sessions', value: '247', detail: '+12% from yesterday', tone: 'blue', icon: Users },
  { label: 'Policy Compliance', value: '98.7%', detail: 'All controls healthy', tone: 'green', icon: Shield },
  { label: 'Threats Blocked', value: '19', detail: 'Last 24 hours', tone: 'red', icon: XCircle },
  { label: 'Audit Events', value: '3,046', detail: 'Today', tone: 'violet', icon: FileText },
];

const policyDataLight = [
  { name: 'Allowed', value: 2847, color: '#22c55e' },
  { name: 'Blocked', value: 156, color: '#dc2626' },
  { name: 'Flagged', value: 43, color: '#f97316' },
];
const policyDataDark = [
  { name: 'Allowed', value: 2847, color: '#4ade80' },
  { name: 'Blocked', value: 156, color: '#f87171' },
  { name: 'Flagged', value: 43, color: '#fb923c' },
];

const threatData = [
  { hour: '10:00', threats: 2 },
  { hour: '11:00', threats: 1 },
  { hour: '12:00', threats: 4 },
  { hour: '13:00', threats: 3 },
  { hour: '14:00', threats: 7 },
  { hour: '15:00', threats: 2 },
];

const architectureNodes = [
  { label: 'Users', tone: 'gray', icon: Users },
  { label: 'Auth Layer', tone: 'blue', icon: Lock },
  { label: 'Policy Engine', tone: 'green', icon: Shield },
  { label: 'AI Agent', tone: 'violet', icon: Server },
  { label: 'Azure Cloud', tone: 'blue', icon: Cloud },
  { label: 'Audit Database', tone: 'orange', icon: Database },
];

const logs = [
  ['2026-03-24 14:32:15', 'admin@contoso.com', 'Policy Updated', 'success', 'Updated PII detection policy'],
  ['2026-03-24 14:28:43', 'analyst@contoso.com', 'Query Executed', 'success', 'Secure chat session initiated'],
  ['2026-03-24 14:25:12', 'user@contoso.com', 'Authentication', 'success', 'MFA verification completed'],
  ['2026-03-24 14:22:08', 'unknown@external.com', 'Prompt Injection', 'blocked', 'Malicious prompt detected and blocked'],
  ['2026-03-24 14:18:55', 'developer@contoso.com', 'API Access', 'success', 'Agent API key validated'],
];

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

export default function DashboardPage() {
  const dark = useDarkMode();
  const gridColor = dark ? '#30363d' : '#E5E7EB';
  const axisColor = dark ? '#c9d1d9' : '#6B7280';
  const greenColor = dark ? '#4ade80' : '#22c55e';
  const redColor = dark ? '#f87171' : '#dc2626';
  const policyData = dark ? policyDataDark : policyDataLight;
  const tooltipStyle = {
    backgroundColor: dark ? '#1c2230' : '#ffffff',
    border: `1px solid ${gridColor}`,
    color: dark ? '#f0f6fc' : '#111827',
  };
  const tooltipTextStyle = { color: dark ? '#f0f6fc' : '#111827' };
  const legendStyle = { color: axisColor };

  return (
    <div className="page-wrap">
      <section className="dashboard-title-row">
        <div>
          <h1>Security and Compliance Dashboard</h1>
          <p>Real-time monitoring of AI governance controls.</p>
        </div>
      </section>

      <section className="critical-alert">
        <strong>
          <AlertTriangle size={18} />
          Prompt Injection Attempt Blocked
        </strong>
        <p>
          At 14:22:08 UTC, a malicious prompt injection attempt from unknown@external.com was
          detected and blocked by policy enforcement.
        </p>
      </section>

      <section className="cards-grid metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
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
              <AreaChart data={authData}>
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
                <Pie data={policyData} cx="50%" cy="50%" innerRadius={52} outerRadius={92} paddingAngle={3} dataKey="value">
                  {policyData.map((entry, index) => (
                    <Cell key={`policy-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipTextStyle} labelStyle={tooltipTextStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="policy-legend">
              {policyData.map((item) => (
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
        <p className="muted">Security threats detected and blocked over the last 6 hours.</p>
        <div className="chart-shell threat-row">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={threatData}>
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
        <p className="muted">Comprehensive audit trail of all system activities.</p>
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
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log[0]}</td>
                  <td>{log[1]}</td>
                  <td>{log[2]}</td>
                  <td><span className={log[3] === 'success' ? 'badge success' : 'badge danger'}>{log[3]}</span></td>
                  <td>{log[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
