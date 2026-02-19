import { useState, useEffect, useCallback } from 'react';
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
  Database,
  Server,
  Cloud,
  RefreshCw,
  Search,
  X,
  TrendingUp,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { AppNavbar } from './AppNavbar';
import {
  AreaChart,
  Area,
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

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'success' | 'blocked' | 'flagged';
  details: string;
  ip: string;
}

const ALL_AUDIT_LOGS: AuditLog[] = [
  { id: '1',  timestamp: '2026-02-18 14:32:15', user: 'admin@contoso.com',     action: 'Policy Updated',       status: 'success', details: 'Updated PII detection policy v2.3',        ip: '10.0.1.5' },
  { id: '2',  timestamp: '2026-02-18 14:28:43', user: 'analyst@contoso.com',   action: 'Query Executed',       status: 'success', details: 'Secure chat session initiated',             ip: '10.0.1.22' },
  { id: '3',  timestamp: '2026-02-18 14:25:12', user: 'user@contoso.com',      action: 'Authentication',       status: 'success', details: 'MFA verification completed',                ip: '10.0.2.10' },
  { id: '4',  timestamp: '2026-02-18 14:22:08', user: 'unknown@external.com',  action: 'Prompt Injection',     status: 'blocked', details: 'Malicious prompt detected and blocked',     ip: '203.0.113.7' },
  { id: '5',  timestamp: '2026-02-18 14:18:55', user: 'developer@contoso.com', action: 'API Access',           status: 'success', details: 'Agent API key validated',                   ip: '10.0.1.15' },
  { id: '6',  timestamp: '2026-02-18 14:15:30', user: 'ml-team@contoso.com',   action: 'Model Invocation',     status: 'success', details: 'GPT-4o invoked via MCP gateway',            ip: '10.0.3.8' },
  { id: '7',  timestamp: '2026-02-18 14:10:02', user: 'user2@contoso.com',     action: 'Data Access',          status: 'flagged', details: 'Unusual data volume access pattern',        ip: '10.0.2.33' },
  { id: '8',  timestamp: '2026-02-18 14:05:47', user: 'ops@contoso.com',       action: 'Config Change',        status: 'success', details: 'Rate limit threshold updated to 500 rpm',  ip: '10.0.1.5' },
  { id: '9',  timestamp: '2026-02-18 13:58:20', user: 'svc-account@contoso',   action: 'Token Refresh',        status: 'success', details: 'OAuth access token refreshed',              ip: '10.0.4.2' },
  { id: '10', timestamp: '2026-02-18 13:50:11', user: 'bot@external.net',      action: 'Rate Limit Exceeded',  status: 'blocked', details: 'Request rate exceeded policy limit',        ip: '198.51.100.9' },
  { id: '11', timestamp: '2026-02-18 13:44:59', user: 'analyst@contoso.com',   action: 'Export Audit Log',     status: 'success', details: 'Audit log export for Jan 2026',            ip: '10.0.1.22' },
  { id: '12', timestamp: '2026-02-18 13:38:30', user: 'user@contoso.com',      action: 'Query Executed',       status: 'success', details: 'LLM query within policy scope',             ip: '10.0.2.10' },
];

const AUTH_DATA_BASE = [
  { time: '00:00', successful: 45, failed: 2 },
  { time: '04:00', successful: 38, failed: 1 },
  { time: '08:00', successful: 92, failed: 5 },
  { time: '12:00', successful: 118, failed: 3 },
  { time: '16:00', successful: 95, failed: 8 },
  { time: '20:00', successful: 67, failed: 2 },
];

const POLICY_DATA = [
  { name: 'Allowed', value: 2847, color: '#10B981' },
  { name: 'Blocked', value: 156, color: '#EF4444' },
  { name: 'Flagged', value: 43, color: '#F59E0B' },
];

const THREAT_DATA_BASE = [
  { hour: '10:00', threats: 2 },
  { hour: '11:00', threats: 1 },
  { hour: '12:00', threats: 4 },
  { hour: '13:00', threats: 3 },
  { hour: '14:00', threats: 7 },
  { hour: '15:00', threats: 2 },
];

function randomDelta(max: number) {
  return Math.floor((Math.random() - 0.3) * max);
}

export function CybersecurityDashboard() {
  const navigate = useNavigate();

  // Live metrics state
  const [activeSessions, setActiveSessions] = useState(247);
  const [threatsBlocked, setThreatsBlocked] = useState(19);
  const [auditEvents, setAuditEvents] = useState(3046);
  const [compliance, setCompliance] = useState(98.7);

  // Alert state
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Audit log filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Auth chart data (slightly randomized on refresh)
  const [authData, setAuthData] = useState(AUTH_DATA_BASE);
  const [threatData, setThreatData] = useState(THREAT_DATA_BASE);

  // Simulate live metric ticks every 8s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSessions((v) => Math.max(200, v + randomDelta(6)));
      setAuditEvents((v) => v + Math.floor(Math.random() * 5) + 1);
      setThreatsBlocked((v) => (Math.random() < 0.15 ? v + 1 : v));
      setCompliance((v) => parseFloat(Math.min(100, Math.max(96, v + (Math.random() - 0.5) * 0.2)).toFixed(1)));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setAuthData(
        AUTH_DATA_BASE.map((d) => ({
          ...d,
          successful: d.successful + randomDelta(12),
          failed: Math.max(0, d.failed + randomDelta(2)),
        }))
      );
      setThreatData(
        THREAT_DATA_BASE.map((d) => ({
          ...d,
          threats: Math.max(0, d.threats + randomDelta(2)),
        }))
      );
      setLastRefreshed(new Date());
      setRefreshing(false);
    }, 900);
  }, []);

  // Filtered audit logs
  const filteredLogs = ALL_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: AuditLog['status']) => {
    if (status === 'success')
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">success</Badge>;
    if (status === 'blocked')
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">blocked</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">flagged</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 max-w-[1800px] mx-auto">
          {/* Header row */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Security & Compliance Dashboard</h1>
              <p className="text-sm text-gray-500">
                Real-time monitoring of AI governance and security controls ·{' '}
                <span className="text-gray-400">
                  Last refreshed {lastRefreshed.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Critical Alert */}
          {!alertDismissed && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900 flex items-center justify-between">
                <span>Prompt Injection Attempt Blocked</span>
                <button
                  onClick={() => setAlertDismissed(true)}
                  className="text-red-400 hover:text-red-600 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </AlertTitle>
              <AlertDescription className="text-red-700 text-sm">
                At 14:22:08 UTC, a malicious prompt injection attempt from{' '}
                <span className="font-medium">unknown@external.com</span> (203.0.113.7) was detected
                and blocked by the policy engine. The user has been flagged for review.{' '}
                <button
                  onClick={() => navigate('/audit')}
                  className="underline inline-flex items-center gap-1 hover:text-red-900"
                >
                  View in Audit Logs <ArrowRight className="w-3 h-3" />
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">{activeSessions.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +12% from yesterday
                    </div>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#0078D4]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Policy Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">{compliance}%</div>
                    <Progress value={compliance} className="w-24 mt-2 h-1.5" />
                  </div>
                  <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threats Blocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">{threatsBlocked}</div>
                    <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Last 24 hours
                    </div>
                  </div>
                  <div className="w-11 h-11 bg-red-50 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audit Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">{auditEvents.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Activity className="w-3 h-3" />
                      Today · live
                    </div>
                  </div>
                  <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Authentication Activity</CardTitle>
                <CardDescription className="text-xs">
                  Successful vs failed authentication attempts over 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={authData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="successful"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.5}
                      name="Successful"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stackId="2"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.5}
                      name="Failed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Policy Enforcement Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Actions taken by the policy engine in the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={260}>
                    <PieChart>
                      <Pie
                        data={POLICY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {POLICY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4 flex-1">
                    {POLICY_DATA.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <div className="text-xs text-gray-500">{item.name}</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {item.value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Threat Timeline */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Threat Detection Timeline</CardTitle>
              <CardDescription className="text-xs">
                Security threats detected and blocked over the last 6 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={threatData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="threats"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Threats Blocked"
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* System Architecture */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">System Architecture</CardTitle>
              <CardDescription className="text-xs">
                MCP Gateway infrastructure — request flow overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl">
                <div className="flex items-center justify-between max-w-4xl mx-auto flex-wrap gap-4">
                  {[
                    { icon: Users,    label: 'Users',          bg: 'bg-white border-2 border-gray-200',  color: 'text-gray-600' },
                    { icon: Lock,     label: 'Auth Layer',     bg: 'bg-[#0078D4]',                       color: 'text-white' },
                    { icon: Shield,   label: 'Policy Engine',  bg: 'bg-green-500',                       color: 'text-white' },
                    { icon: Server,   label: 'MCP Gateway',    bg: 'bg-purple-500',                      color: 'text-white' },
                    { icon: Cloud,    label: 'Azure AI',       bg: 'bg-[#0078D4]',                       color: 'text-white' },
                  ].map((node, i, arr) => (
                    <div key={node.label} className="flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-16 h-16 ${node.bg} rounded-xl flex items-center justify-center shadow-md`}
                        >
                          <node.icon className={`w-8 h-8 ${node.color}`} />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{node.label}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-[#0078D4] flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-6">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <Database className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Audit Database</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base">Recent Audit Logs</CardTitle>
                  <CardDescription className="text-xs">
                    {filteredLogs.length} of {ALL_AUDIT_LOGS.length} events shown
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search logs…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-sm w-52"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-32 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => navigate('/audit')}
                  >
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">Timestamp</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">User</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">Action</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">IP</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">Status</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.slice(0, 8).map((log) => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 text-gray-500 text-xs whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-3 text-gray-700 text-xs">{log.user}</td>
                        <td className="py-2.5 px-3 text-gray-900 text-xs font-medium">{log.action}</td>
                        <td className="py-2.5 px-3 text-gray-500 text-xs font-mono">{log.ip}</td>
                        <td className="py-2.5 px-3">{statusBadge(log.status)}</td>
                        <td className="py-2.5 px-3 text-gray-500 text-xs">{log.details}</td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                          No audit logs match your filters.
                        </td>
                      </tr>
                    )}
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
