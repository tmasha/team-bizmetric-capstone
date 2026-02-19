import { useNavigate } from 'react-router';
import {
  Shield,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  ArrowRight,
  Home,
  MessageSquare,
  Database,
  Server,
  Cloud,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AppNavbar } from './AppNavbar';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function CybersecurityDashboard() {
  const navigate = useNavigate();

  const authData = [
    { time: '00:00', successful: 45, failed: 2 },
    { time: '04:00', successful: 38, failed: 1 },
    { time: '08:00', successful: 92, failed: 5 },
    { time: '12:00', successful: 118, failed: 3 },
    { time: '16:00', successful: 95, failed: 8 },
    { time: '20:00', successful: 67, failed: 2 },
  ];

  const policyData = [
    { name: 'Allowed', value: 2847, color: '#10B981' },
    { name: 'Blocked', value: 156, color: '#EF4444' },
    { name: 'Flagged', value: 43, color: '#F59E0B' },
  ];

  const auditLogs = [
    {
      id: '1',
      timestamp: '2026-02-19 14:32:15',
      user: 'admin@contoso.com',
      action: 'Policy Updated',
      status: 'success',
      details: 'Updated PII detection policy',
    },
    {
      id: '2',
      timestamp: '2026-02-19 14:28:43',
      user: 'analyst@contoso.com',
      action: 'Query Executed',
      status: 'success',
      details: 'Secure chat session initiated',
    },
    {
      id: '3',
      timestamp: '2026-02-19 14:25:12',
      user: 'user@contoso.com',
      action: 'Authentication',
      status: 'success',
      details: 'MFA verification completed',
    },
    {
      id: '4',
      timestamp: '2026-02-19 14:22:08',
      user: 'unknown@external.com',
      action: 'Prompt Injection',
      status: 'blocked',
      details: 'Malicious prompt detected and blocked',
    },
    {
      id: '5',
      timestamp: '2026-02-19 14:18:55',
      user: 'developer@contoso.com',
      action: 'API Access',
      status: 'success',
      details: 'Agent API key validated',
    },
  ];

  const threatData = [
    { hour: '10:00', threats: 2 },
    { hour: '11:00', threats: 1 },
    { hour: '12:00', threats: 4 },
    { hour: '13:00', threats: 3 },
    { hour: '14:00', threats: 7 },
    { hour: '15:00', threats: 2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 max-w-[1800px] mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">Security & Compliance Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring of AI governance and security controls</p>
          </div>

          {/* Critical Alert */}
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-900">Prompt Injection Attempt Blocked</AlertTitle>
            <AlertDescription className="text-red-700">
              At 14:22:08 UTC, a malicious prompt injection attempt from unknown@external.com was detected 
              and blocked by policy enforcement. The incident has been logged and the user has been flagged for review.
              <Button variant="link" className="text-red-700 underline p-0 h-auto ml-2">
                View Details <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl text-gray-900 mb-1">247</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>+12% from yesterday</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#0078D4]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Policy Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl text-gray-900 mb-1">98.7%</div>
                    <Progress value={98.7} className="w-24 mt-2" />
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Threats Blocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl text-gray-900 mb-1">19</div>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Last 24 hours</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Audit Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl text-gray-900 mb-1">3,046</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Activity className="w-4 h-4" />
                      <span>Today</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Authentication Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication Activity</CardTitle>
                <CardDescription>Successful and failed authentication attempts over 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
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
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Successful"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="failed" 
                      stackId="2"
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                      name="Failed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Policy Enforcement */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Enforcement Distribution</CardTitle>
                <CardDescription>Actions taken by policy engine in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="50%" height={300}>
                    <PieChart>
                      <Pie
                        data={policyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {policyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {policyData.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <div className="text-sm text-gray-900">{item.name}</div>
                          <div className="text-xl">{item.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Architecture Diagram */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>Azure AI Governance Platform infrastructure overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                  {/* Users */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-md">
                      <Users className="w-10 h-10 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">Users</span>
                  </div>

                  <ArrowRight className="w-8 h-8 text-[#0078D4]" />

                  {/* API Gateway */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-[#0078D4] rounded-lg flex items-center justify-center shadow-lg">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">Auth Layer</span>
                  </div>

                  <ArrowRight className="w-8 h-8 text-[#0078D4]" />

                  {/* Policy Engine */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                      <Shield className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">Policy Engine</span>
                  </div>

                  <ArrowRight className="w-8 h-8 text-[#0078D4]" />

                  {/* AI Agent */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                      <Server className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">AI Agent</span>
                  </div>

                  <ArrowRight className="w-8 h-8 text-[#0078D4]" />

                  {/* Azure Services */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-[#0078D4] rounded-lg flex items-center justify-center shadow-lg">
                      <Cloud className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">Azure Cloud</span>
                  </div>
                </div>

                {/* Audit Log Database */}
                <div className="flex justify-center mt-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                      <Database className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm text-gray-700">Audit Database</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Threat Detection Timeline */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Threat Detection Timeline</CardTitle>
              <CardDescription>Security threats detected and blocked over the last 6 hours</CardDescription>
            </CardHeader>
            <CardContent>
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
                    dot={{ fill: '#EF4444', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>Comprehensive audit trail of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Timestamp</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">User</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Action</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-700">{log.timestamp}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{log.user}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{log.action}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              log.status === 'success'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-red-100 text-red-700 hover:bg-red-100'
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}