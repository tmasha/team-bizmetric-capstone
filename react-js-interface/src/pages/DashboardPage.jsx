import React from 'react';
const metrics = [
  { label: 'Active Sessions', value: '247', detail: '+12% from yesterday' },
  { label: 'Policy Compliance', value: '98.7%', detail: 'All controls healthy' },
  { label: 'Threats Blocked', value: '19', detail: 'Last 24 hours' },
  { label: 'Audit Events', value: '3,046', detail: 'Today' },
];

const bars = [
  { label: 'Allowed', value: 88 },
  { label: 'Blocked', value: 7 },
  { label: 'Flagged', value: 5 },
];

const logs = [
  ['2026-03-24 14:32:15', 'admin@contoso.com', 'Policy Updated', 'success'],
  ['2026-03-24 14:28:43', 'analyst@contoso.com', 'Query Executed', 'success'],
  ['2026-03-24 14:22:08', 'unknown@external.com', 'Prompt Injection', 'blocked'],
  ['2026-03-24 14:18:55', 'developer@contoso.com', 'API Access', 'success'],
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

      <section className="cards-grid metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="card metric-card">
            <h3>{metric.label}</h3>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="cards-grid charts-grid">
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
      </section>

      <section className="card table-card">
        <h3>Recent Audit Logs</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Status</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
