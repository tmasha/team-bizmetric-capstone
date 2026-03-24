import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Access Control',
    description: 'Role-based access control and identity verification for every agent interaction.',
  },
  {
    title: 'Policy Enforcement',
    description: 'Prompt and response checks that enforce security and compliance policies in real time.',
  },
  {
    title: 'Audit Logging',
    description: 'Full traceability for all actions, users, and policy decisions.',
  },
];

export default function LandingPage() {
  return (
    <div className="page-wrap">
      <section className="hero">
        <p className="eyebrow">Enterprise AI Security on Azure</p>
        <h1>Secure Agentic AI Governance Platform</h1>
        <p className="hero-copy">
          A clean JavaScript React version of the interface with straightforward structure,
          simpler styling, and easy-to-maintain components.
        </p>
        <div className="hero-actions">
          <Link className="button primary" to="/chat">
            Launch Secure Agent
          </Link>
          <Link className="button" to="/dashboard">
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="cards-grid">
        {features.map((feature) => (
          <article key={feature.title} className="card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="stats-row">
        <div className="stat">
          <strong>99.9%</strong>
          <span>Uptime SLA</span>
        </div>
        <div className="stat">
          <strong>100%</strong>
          <span>Audit Coverage</span>
        </div>
        <div className="stat">
          <strong>&lt;10ms</strong>
          <span>Policy Check Latency</span>
        </div>
      </section>
    </div>
  );
}
