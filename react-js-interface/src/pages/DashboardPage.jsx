import React from 'react';
const metrics = [
  { label: 'Active Sessions', value: '247', detail: '+12% from yesterday', tone: 'blue' },
  { label: 'Policy Compliance', value: '98.7%', detail: 'All controls healthy', tone: 'green' },
  { label: 'Threats Blocked', value: '19', detail: 'Last 24 hours', tone: 'red' },
  { label: 'Audit Events', value: '3,046', detail: 'Today', tone: 'violet' },
];

const bars = [
  { label: 'Allowed', value: 88 },
  { label: 'Blocked', value: 7 },
  { label: 'Flagged', value: 5 },
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
        <strong>Prompt Injection Attempt Blocked</strong>
        <p>
          At 14:22:08 UTC, a malicious prompt injection attempt from unknown@external.com was
          detected and blocked by policy enforcement.
        </p>
      </section>

      <section className="cards-grid metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="card metric-card">
            <h3>{metric.label}</h3>
            <div className="metric-main">
              <strong>{metric.value}</strong>
              <span className={`metric-icon ${metric.tone}`}>■</span>
            </div>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="cards-grid charts-grid">
        <article className="card">
          <div className="card-title-row">
            <h3>Authentication Activity</h3>
            <p>Successful and failed authentication attempts</p>
          </div>
          <div className="line-chart-placeholder" />
        </article>

        <article className="card">
          <h3>Policy Enforcement Distribution</h3>
          <div className="bar-list">
            {bars.map((bar) => (
              <div key={bar.label} className="bar-item">
                <span>{bar.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${bar.value}%` }} />
                </div>
                <span>{bar.value}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <h3>System Architecture</h3>
        <p className="muted">Azure AI Governance Platform infrastructure overview.</p>
        <div className="flow-row architecture-row">
          <span>Users</span>
          <span>Auth Layer</span>
          <span>Policy Engine</span>
          <span>AI Agent</span>
          <span>Azure Cloud</span>
        </div>
      </section>

      <section className="card">
        <h3>Threat Detection Timeline</h3>
        <p className="muted">Security threats detected and blocked over the last 6 hours.</p>
        <div className="threat-row">
          <span style={{ '--h': 30 }}>10:00</span>
          <span style={{ '--h': 22 }}>11:00</span>
          <span style={{ '--h': 58 }}>12:00</span>
          <span style={{ '--h': 44 }}>13:00</span>
          <span style={{ '--h': 82 }}>14:00</span>
          <span style={{ '--h': 36 }}>15:00</span>
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
            <span>User</span>
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
