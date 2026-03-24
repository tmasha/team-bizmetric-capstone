import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cloud,
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

const policyData = [
  { name: 'Allowed', value: 2847, color: '#10B981' },
  { name: 'Blocked', value: 156, color: '#EF4444' },
  { name: 'Flagged', value: 43, color: '#F59E0B' },
];

const threatData = [
  { hour: '10:00', threats: 2 },
  { hour: '11:00', threats: 1 },
  { hour: '12:00', threats: 4 },
  { hour: '13:00', threats: 3 },
  { hour: '14:00', threats: 7 },
  { hour: '15:00', threats: 2 },
];

const logs = [
  ['2026-03-24 14:32:15', 'admin@contoso.com', 'Policy Updated', 'success', 'Updated PII detection policy'],
  ['2026-03-24 14:28:43', 'analyst@contoso.com', 'Query Executed', 'success', 'Secure chat session initiated'],
  ['2026-03-24 14:25:12', 'user@contoso.com', 'Authentication', 'success', 'MFA verification completed'],
  ['2026-03-24 14:22:08', 'unknown@external.com', 'Prompt Injection', 'blocked', 'Malicious prompt detected and blocked'],
  ['2026-03-24 14:18:55', 'developer@contoso.com', 'API Access', 'success', 'Agent API key validated'],
];

export default function DashboardPage() {
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
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="successful"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.45}
                  name="Successful"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.45}
                  name="Failed"
                />
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
                  data={policyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={92}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {policyData.map((entry, index) => (
                    <Cell key={`policy-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
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
        <div className="flow-row architecture-row">
          <span>
            <Users size={18} />
            Users
          </span>
          <span>
            <Lock size={18} />
            Auth Layer
          </span>
          <span>
            <Shield size={18} />
            Policy Engine
          </span>
          <span>
            <Server size={18} />
            AI Agent
          </span>
          <span>
            <Cloud size={18} />
            Azure Cloud
          </span>
        </div>
        <div className="audit-db-node">
          <span>
            <Database size={20} />
          </span>
          <p>Audit Database</p>
        </div>
      </section>

      <section className="card">
        <h3>Threat Detection Timeline</h3>
        <p className="muted">Security threats detected and blocked over the last 6 hours.</p>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={threatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="hour" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="threats"
                stroke="#EF4444"
                strokeWidth={2}
                name="Threats Blocked"
                dot={{ fill: '#EF4444', r: 4 }}
              />
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
                  <td>
                    <span className={log[3] === 'success' ? 'badge success' : 'badge danger'}>{log[3]}</span>
                  </td>
                  <td>{log[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="cards-grid charts-grid compact-last-row">
        <article className="card">
          <h3>System Flow</h3>
          <div className="flow-row">
            <span>Users</span>
            <span>Auth</span>
            <span>Policy</span>
            <span>Agent</span>
            <span>Cloud</span>
          </div>
          <p className="muted">Every step is validated and logged to the audit database.</p>
        </article>
        <article className="card" />
      </section>
    </div>
  );
}
