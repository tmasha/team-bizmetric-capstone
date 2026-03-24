import React from 'react';
import { ArrowRight, FileText, Lock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Lock,
    title: 'Access Control',
    description: 'Role-based access control and identity verification for every agent interaction.',
  },
  {
    icon: Shield,
    title: 'Policy Enforcement',
    description: 'Prompt and response checks that enforce security and compliance policies in real time.',
  },
  {
    icon: FileText,
    title: 'Audit Logging',
    description: 'Full traceability for all actions, users, and policy decisions.',
  },
];

export default function LandingPage() {
  return (
    <div className="page-wrap landing-wrap">
      <section className="hero hero-centered">
        <p className="eyebrow">Enterprise AI Security on Azure</p>
        <h1>Secure Agentic AI Governance Platform</h1>
        <p className="hero-copy">
          Enterprise-grade security and governance for AI agents. Built on Microsoft Azure with
          comprehensive access controls, policy enforcement, and compliance monitoring.
        </p>
        <div className="hero-actions hero-actions-center">
          <Link className="button primary" to="/chat">
            Launch Secure Agent
            <ArrowRight size={16} />
          </Link>
          <Link className="button outline" to="/dashboard">
            View Dashboard
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>Enterprise Security Features</h2>
          <p>Comprehensive governance capabilities designed for enterprise AI deployments.</p>
        </div>
        <div className="cards-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="card feature-card">
                <span className="feature-icon">
                  <Icon size={20} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="stats-row stats-prominent">
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

      <footer className="landing-footer">
        <p>© 2026 Azure AI Governance Platform. Powered by Microsoft Azure.</p>
      </footer>
    </div>
  );
}
