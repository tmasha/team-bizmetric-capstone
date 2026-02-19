import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { CybersecurityDashboard } from './components/CybersecurityDashboard';
import { PolicyManagement } from './components/PolicyManagement';
import { AuditLogs } from './components/AuditLogs';
import { Settings } from './components/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/dashboard" element={<CybersecurityDashboard />} />
        <Route path="/policies" element={<PolicyManagement />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
