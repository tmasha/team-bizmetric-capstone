import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { CybersecurityDashboard } from './components/CybersecurityDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatInterface />} />
        <Route path="/dashboard" element={<CybersecurityDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
