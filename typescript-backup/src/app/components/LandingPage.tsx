import { useNavigate } from 'react-router';
import { Shield, Lock, FileText, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AppNavbar } from './AppNavbar';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: 'Access Control',
      description: 'Enterprise-grade authentication and authorization with role-based access control (RBAC) and multi-factor authentication.',
    },
    {
      icon: Shield,
      title: 'Policy Enforcement',
      description: 'Real-time policy validation and enforcement to ensure AI agents comply with organizational security standards.',
    },
    {
      icon: FileText,
      title: 'Audit Logging',
      description: 'Comprehensive audit trails with full traceability of AI agent activities and user interactions for compliance.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      <div className="overflow-y-auto">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#0078D4]" />
              <span className="text-sm text-[#0078D4]">Enterprise AI Security on Azure</span>
            </div>
            
            <h1 className="text-5xl mb-6 text-gray-900">
              Secure Agentic AI Governance Platform
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Enterprise-grade security and governance for AI agents. Built on Microsoft Azure 
              with comprehensive access controls, policy enforcement, and compliance monitoring 
              to protect your organization's AI interactions.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-[#0078D4] hover:bg-[#106EBE] text-white px-8"
                onClick={() => navigate('/chat')}
              >
                Launch Secure Agent
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl mb-4 text-gray-900">
                Enterprise Security Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive governance capabilities designed for enterprise AI deployments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-[#0078D4]" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Security Stats */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-[#0078D4] to-[#106EBE] rounded-2xl p-12 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl mb-2">99.9%</div>
                <div className="text-blue-100">Uptime SLA</div>
              </div>
              <div>
                <div className="text-4xl mb-2">100%</div>
                <div className="text-blue-100">Audit Coverage</div>
              </div>
              <div>
                <div className="text-4xl mb-2">&lt;10ms</div>
                <div className="text-blue-100">Policy Check Latency</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
            <p>© 2026 Azure AI Governance Platform. Powered by Microsoft Azure.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}