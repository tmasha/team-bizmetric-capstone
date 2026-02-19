import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { AppNavbar } from './AppNavbar';

type Status = 'success' | 'blocked' | 'flagged';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: Status;
  details: string;
  ip: string;
  sessionId: string;
  model: string | null;
  policyTriggered: string | null;
}

const AUDIT_DATA: AuditEntry[] = [
  { id: 'EVT-001', timestamp: '2026-02-18 14:32:15', user: 'admin@contoso.com',      action: 'Policy Updated',       status: 'success', details: 'Updated PII detection policy v2.3',                       ip: '10.0.1.5',    sessionId: 'SES-8A2C', model: null,              policyTriggered: null },
  { id: 'EVT-002', timestamp: '2026-02-18 14:28:43', user: 'analyst@contoso.com',    action: 'Query Executed',       status: 'success', details: 'Secure chat session initiated with GPT-4o',               ip: '10.0.1.22',   sessionId: 'SES-9D1F', model: 'GPT-4o',          policyTriggered: null },
  { id: 'EVT-003', timestamp: '2026-02-18 14:25:12', user: 'user@contoso.com',       action: 'Authentication',       status: 'success', details: 'MFA verification completed, session granted',             ip: '10.0.2.10',   sessionId: 'SES-7B3E', model: null,              policyTriggered: null },
  { id: 'EVT-004', timestamp: '2026-02-18 14:22:08', user: 'unknown@external.com',   action: 'Prompt Injection',     status: 'blocked', details: 'Adversarial prompt detected attempting to override system', ip: '203.0.113.7', sessionId: 'SES-ERR1', model: 'GPT-4o',          policyTriggered: 'Prompt Injection Guard' },
  { id: 'EVT-005', timestamp: '2026-02-18 14:18:55', user: 'developer@contoso.com',  action: 'API Access',           status: 'success', details: 'Agent API key validated, gateway access granted',         ip: '10.0.1.15',   sessionId: 'SES-4C9A', model: null,              policyTriggered: null },
  { id: 'EVT-006', timestamp: '2026-02-18 14:15:30', user: 'ml-team@contoso.com',    action: 'Model Invocation',     status: 'success', details: 'GPT-4o invoked via MCP gateway for data analysis',        ip: '10.0.3.8',    sessionId: 'SES-2E7D', model: 'GPT-4o',          policyTriggered: null },
  { id: 'EVT-007', timestamp: '2026-02-18 14:10:02', user: 'user2@contoso.com',      action: 'Data Access',          status: 'flagged', details: 'Unusual data volume — 450MB accessed in single session',  ip: '10.0.2.33',   sessionId: 'SES-5A1B', model: 'GPT-4o Mini',     policyTriggered: 'Confidential Data Classifier' },
  { id: 'EVT-008', timestamp: '2026-02-18 14:05:47', user: 'ops@contoso.com',        action: 'Config Change',        status: 'success', details: 'Rate limit threshold updated to 500 requests/min',       ip: '10.0.1.5',    sessionId: 'SES-8A2C', model: null,              policyTriggered: null },
  { id: 'EVT-009', timestamp: '2026-02-18 13:58:20', user: 'svc-account@contoso',    action: 'Token Refresh',        status: 'success', details: 'OAuth access token refreshed for service account',        ip: '10.0.4.2',    sessionId: 'SES-3F8C', model: null,              policyTriggered: null },
  { id: 'EVT-010', timestamp: '2026-02-18 13:50:11', user: 'bot@external.net',       action: 'Rate Limit Exceeded',  status: 'blocked', details: 'Request rate exceeded 500 rpm policy limit',             ip: '198.51.100.9',sessionId: 'SES-ERR2', model: null,              policyTriggered: 'API Rate Limiter' },
  { id: 'EVT-011', timestamp: '2026-02-18 13:44:59', user: 'analyst@contoso.com',    action: 'Export Audit Log',     status: 'success', details: 'Audit log export requested for January 2026',            ip: '10.0.1.22',   sessionId: 'SES-9D1F', model: null,              policyTriggered: null },
  { id: 'EVT-012', timestamp: '2026-02-18 13:38:30', user: 'user@contoso.com',       action: 'Query Executed',       status: 'success', details: 'LLM query completed within policy scope',                ip: '10.0.2.10',   sessionId: 'SES-7B3E', model: 'GPT-4o',          policyTriggered: null },
  { id: 'EVT-013', timestamp: '2026-02-18 13:30:05', user: 'admin@contoso.com',      action: 'User Role Change',     status: 'success', details: 'analyst@contoso.com promoted to Senior Analyst role',    ip: '10.0.1.5',    sessionId: 'SES-8A2C', model: null,              policyTriggered: null },
  { id: 'EVT-014', timestamp: '2026-02-18 13:22:17', user: 'user3@contoso.com',      action: 'Authentication',       status: 'blocked', details: 'Invalid MFA token, account temporarily locked',          ip: '10.0.2.77',   sessionId: 'SES-ERR3', model: null,              policyTriggered: 'Role-Based Access Control' },
  { id: 'EVT-015', timestamp: '2026-02-18 13:15:44', user: 'developer@contoso.com',  action: 'Model Invocation',     status: 'success', details: 'Claude 3.5 Sonnet invoked for code review task',        ip: '10.0.1.15',   sessionId: 'SES-4C9A', model: 'Claude 3.5 Sonnet', policyTriggered: null },
  { id: 'EVT-016', timestamp: '2026-02-18 13:08:00', user: 'ml-team@contoso.com',    action: 'PII Detected',         status: 'blocked', details: 'SSN pattern detected in prompt — request blocked',       ip: '10.0.3.8',    sessionId: 'SES-2E7D', model: 'GPT-4o',          policyTriggered: 'PII Detection & Redaction' },
  { id: 'EVT-017', timestamp: '2026-02-18 12:55:30', user: 'ops@contoso.com',        action: 'System Health Check',  status: 'success', details: 'All gateway services healthy, 0 errors in last hour',    ip: '10.0.1.5',    sessionId: 'SES-SYS1', model: null,              policyTriggered: null },
  { id: 'EVT-018', timestamp: '2026-02-18 12:40:12', user: 'user@contoso.com',       action: 'Query Executed',       status: 'flagged', details: 'Query contains keywords matching confidential policy',   ip: '10.0.2.10',   sessionId: 'SES-7B3E', model: 'GPT-4o Mini',     policyTriggered: 'Confidential Data Classifier' },
  { id: 'EVT-019', timestamp: '2026-02-18 12:15:00', user: 'developer@contoso.com',  action: 'API Key Rotation',     status: 'success', details: 'API key rotated per 30-day security policy',             ip: '10.0.1.15',   sessionId: 'SES-4C9A', model: null,              policyTriggered: null },
  { id: 'EVT-020', timestamp: '2026-02-18 12:00:00', user: 'admin@contoso.com',      action: 'GDPR Request',         status: 'success', details: 'Data subject access request processed and fulfilled',    ip: '10.0.1.5',    sessionId: 'SES-8A2C', model: null,              policyTriggered: 'GDPR Compliance Monitor' },
];

const PAGE_SIZE = 10;

const STATUS_CONFIG: Record<Status, { icon: typeof CheckCircle2; badge: string }> = {
  success: { icon: CheckCircle2, badge: 'bg-green-100 text-green-700' },
  blocked: { icon: XCircle,      badge: 'bg-red-100 text-red-700' },
  flagged: { icon: AlertTriangle, badge: 'bg-amber-100 text-amber-700' },
};

export function AuditLogs() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const uniqueActions = useMemo(
    () => Array.from(new Set(AUDIT_DATA.map((e) => e.action))).sort(),
    []
  );

  const filtered = useMemo(
    () =>
      AUDIT_DATA.filter((e) => {
        const q = search.toLowerCase();
        const matchSearch =
          !search ||
          e.user.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.ip.includes(q);
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        const matchAction = actionFilter === 'all' || e.action === actionFilter;
        return matchSearch && matchStatus && matchAction;
      }),
    [search, statusFilter, actionFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageEntries = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetFilters() {
    setSearch('');
    setStatusFilter('all');
    setActionFilter('all');
    setPage(1);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }

  function exportCSV() {
    const header = 'ID,Timestamp,User,Action,Status,IP,Session ID,Model,Policy Triggered,Details';
    const rows = filtered.map((e) =>
      [
        e.id,
        e.timestamp,
        e.user,
        e.action,
        e.status,
        e.ip,
        e.sessionId,
        e.model ?? '',
        e.policyTriggered ?? '',
        `"${e.details.replace(/"/g, '""')}"`,
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const successCount = AUDIT_DATA.filter((e) => e.status === 'success').length;
  const blockedCount = AUDIT_DATA.filter((e) => e.status === 'blocked').length;
  const flaggedCount = AUDIT_DATA.filter((e) => e.status === 'flagged').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Audit Logs</h1>
              <p className="text-sm text-gray-500">
                Complete audit trail of all MCP gateway interactions and security events
              </p>
            </div>
            <div className="flex gap-2">
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
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Events',    value: AUDIT_DATA.length, icon: FileText,      color: 'text-[#0078D4]', bg: 'bg-blue-50' },
              { label: 'Successful',       value: successCount,       icon: CheckCircle2,  color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Blocked',          value: blockedCount,       icon: XCircle,       color: 'text-red-500',   bg: 'bg-red-50' },
              { label: 'Flagged',          value: flaggedCount,       icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                    <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by user, action, ID, IP…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-8 w-36 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-8 w-48 text-sm">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(search || statusFilter !== 'all' || actionFilter !== 'all') && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs text-gray-500">
                    Clear filters
                  </Button>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {filtered.length} of {AUDIT_DATA.length} events
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">Event ID</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 whitespace-nowrap">Timestamp</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">User</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Action</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">IP</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageEntries.map((entry) => {
                      const cfg = STATUS_CONFIG[entry.status];
                      return (
                        <tr
                          key={entry.id}
                          onClick={() => setSelectedEntry(entry)}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 px-4 text-xs font-mono text-gray-500">{entry.id}</td>
                          <td className="py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap">{entry.timestamp}</td>
                          <td className="py-2.5 px-4 text-xs text-gray-700">{entry.user}</td>
                          <td className="py-2.5 px-4 text-xs font-medium text-gray-900 whitespace-nowrap">{entry.action}</td>
                          <td className="py-2.5 px-4 text-xs font-mono text-gray-500">{entry.ip}</td>
                          <td className="py-2.5 px-4">
                            <Badge className={`${cfg.badge} hover:${cfg.badge} text-xs`}>
                              {entry.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-gray-500 max-w-xs truncate">{entry.details}</td>
                        </tr>
                      );
                    })}
                    {pageEntries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                          No audit events match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Page {currentPage} of {totalPages} · {filtered.length} results
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => (
                        <>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span key={`ellipsis-${p}`} className="text-gray-400 text-xs px-1">…</span>
                          )}
                          <Button
                            key={p}
                            variant={p === currentPage ? 'default' : 'outline'}
                            size="sm"
                            className={`h-7 w-7 p-0 text-xs ${p === currentPage ? 'bg-[#0078D4] hover:bg-[#106EBE] text-white' : ''}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        </>
                      ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Event Detail Dialog */}
      {selectedEntry && (
        <Dialog open onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0078D4]" />
                Event Detail — {selectedEntry.id}
              </DialogTitle>
              <DialogDescription>Full audit event record</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-sm">
              {[
                ['Timestamp',       selectedEntry.timestamp],
                ['User',            selectedEntry.user],
                ['IP Address',      selectedEntry.ip],
                ['Session ID',      selectedEntry.sessionId],
                ['Action',          selectedEntry.action],
                ['Model',           selectedEntry.model ?? 'N/A'],
                ['Policy Triggered', selectedEntry.policyTriggered ?? 'None'],
                ['Details',         selectedEntry.details],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-gray-500 w-36 flex-shrink-0 text-xs font-medium pt-0.5">{label}</span>
                  <span className="text-gray-800 text-xs flex-1 break-all">{value}</span>
                </div>
              ))}
              <div className="flex gap-3">
                <span className="text-gray-500 w-36 flex-shrink-0 text-xs font-medium pt-0.5">Status</span>
                <Badge className={`${STATUS_CONFIG[selectedEntry.status].badge} text-xs`}>
                  {selectedEntry.status}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
