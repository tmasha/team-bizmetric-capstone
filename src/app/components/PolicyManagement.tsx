import { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AppNavbar } from './AppNavbar';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Category = 'Data Privacy' | 'Access Control' | 'Content Safety' | 'Rate Limiting' | 'Compliance';

interface Policy {
  id: string;
  name: string;
  description: string;
  category: Category;
  severity: Severity;
  enabled: boolean;
  triggeredToday: number;
  lastTriggered: string | null;
  action: 'block' | 'flag' | 'log';
}

const INITIAL_POLICIES: Policy[] = [
  {
    id: '1',
    name: 'PII Detection & Redaction',
    description: 'Detects and redacts personally identifiable information (SSN, email, phone, credit card) from all AI prompts and responses.',
    category: 'Data Privacy',
    severity: 'critical',
    enabled: true,
    triggeredToday: 7,
    lastTriggered: '2026-02-18 14:05:12',
    action: 'block',
  },
  {
    id: '2',
    name: 'Prompt Injection Guard',
    description: 'Identifies and blocks adversarial prompts designed to override system instructions or manipulate AI behavior.',
    category: 'Content Safety',
    severity: 'critical',
    enabled: true,
    triggeredToday: 3,
    lastTriggered: '2026-02-18 14:22:08',
    action: 'block',
  },
  {
    id: '3',
    name: 'Role-Based Access Control',
    description: 'Enforces RBAC policies ensuring users can only invoke AI capabilities authorized by their assigned organizational role.',
    category: 'Access Control',
    severity: 'high',
    enabled: true,
    triggeredToday: 12,
    lastTriggered: '2026-02-18 13:58:44',
    action: 'block',
  },
  {
    id: '4',
    name: 'Toxic Content Filter',
    description: 'Prevents generation of hate speech, violent content, or inappropriate material through the MCP gateway.',
    category: 'Content Safety',
    severity: 'high',
    enabled: true,
    triggeredToday: 2,
    lastTriggered: '2026-02-18 11:30:00',
    action: 'block',
  },
  {
    id: '5',
    name: 'API Rate Limiter',
    description: 'Enforces per-user and per-application request rate limits to prevent abuse and ensure fair resource allocation.',
    category: 'Rate Limiting',
    severity: 'medium',
    enabled: true,
    triggeredToday: 18,
    lastTriggered: '2026-02-18 13:50:11',
    action: 'block',
  },
  {
    id: '6',
    name: 'Audit Log All Requests',
    description: 'Logs every AI request and response to the centralized audit database for compliance and traceability.',
    category: 'Compliance',
    severity: 'low',
    enabled: true,
    triggeredToday: 3046,
    lastTriggered: '2026-02-18 14:32:00',
    action: 'log',
  },
  {
    id: '7',
    name: 'Confidential Data Classifier',
    description: 'Flags requests that appear to involve trade secrets, internal IP, or confidential business information for review.',
    category: 'Data Privacy',
    severity: 'high',
    enabled: true,
    triggeredToday: 4,
    lastTriggered: '2026-02-18 12:15:30',
    action: 'flag',
  },
  {
    id: '8',
    name: 'External URL Restriction',
    description: 'Prevents AI agents from fetching or referencing external URLs not on the organization allowlist.',
    category: 'Access Control',
    severity: 'medium',
    enabled: false,
    triggeredToday: 0,
    lastTriggered: null,
    action: 'block',
  },
  {
    id: '9',
    name: 'GDPR Compliance Monitor',
    description: 'Monitors interactions for GDPR compliance, including data minimization and lawful basis checks.',
    category: 'Compliance',
    severity: 'high',
    enabled: true,
    triggeredToday: 1,
    lastTriggered: '2026-02-18 09:45:00',
    action: 'flag',
  },
  {
    id: '10',
    name: 'Model Output Length Cap',
    description: 'Caps AI model output length to prevent excessive token usage and control costs.',
    category: 'Rate Limiting',
    severity: 'low',
    enabled: false,
    triggeredToday: 0,
    lastTriggered: null,
    action: 'log',
  },
];

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; icon: typeof Shield }> = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700',    icon: ShieldAlert },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-700', icon: ShieldAlert },
  medium:   { label: 'Medium',   color: 'bg-amber-100 text-amber-700',  icon: ShieldCheck },
  low:      { label: 'Low',      color: 'bg-gray-100 text-gray-600',    icon: ShieldOff },
};

const ACTION_CONFIG: Record<Policy['action'], { label: string; color: string }> = {
  block: { label: 'Block',  color: 'bg-red-50 text-red-600 border-red-100' },
  flag:  { label: 'Flag',   color: 'bg-amber-50 text-amber-600 border-amber-100' },
  log:   { label: 'Log',    color: 'bg-blue-50 text-blue-600 border-blue-100' },
};

const CATEGORIES: Category[] = ['Data Privacy', 'Access Control', 'Content Safety', 'Rate Limiting', 'Compliance'];

export function PolicyManagement() {
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null);

  const filtered = policies.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'enabled' && p.enabled) ||
      (statusFilter === 'disabled' && !p.enabled);
    return matchSearch && matchCat && matchStatus;
  });

  function togglePolicy(id: string) {
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }

  function deletePolicy(id: string) {
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  }

  function savePolicy(updated: Policy) {
    setPolicies((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPolicy(null);
  }

  const enabledCount = policies.filter((p) => p.enabled).length;
  const totalTriggered = policies.reduce((s, p) => s + p.triggeredToday, 0);
  const criticalCount = policies.filter((p) => p.severity === 'critical' && p.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Policy Management</h1>
              <p className="text-sm text-gray-500">
                Configure and manage security policies enforced by the MCP gateway
              </p>
            </div>
            <Button className="bg-[#0078D4] hover:bg-[#106EBE] text-white gap-2">
              <Plus className="w-4 h-4" />
              New Policy
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Policies',     value: policies.length,  icon: Shield,       color: 'text-[#0078D4]', bg: 'bg-blue-50' },
              { label: 'Active Policies',    value: enabledCount,     icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Critical Policies',  value: criticalCount,    icon: AlertTriangle, color: 'text-red-500',  bg: 'bg-red-50' },
              { label: 'Triggered Today',    value: totalTriggered,   icon: Info,         color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{stat.value.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                    <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
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
                <div className="relative flex-1 min-w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search policies…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-44 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-36 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-400">{filtered.length} policies</span>
              </div>
            </CardContent>
          </Card>

          {/* Policy Table */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Policy</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Severity</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Action</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Triggered Today</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Enabled</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((policy) => {
                    const sev = SEVERITY_CONFIG[policy.severity];
                    const act = ACTION_CONFIG[policy.action];
                    return (
                      <tr
                        key={policy.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          !policy.enabled ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{policy.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                            {policy.description}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs font-normal">
                            {policy.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${sev.color} hover:${sev.color} text-xs`}>
                            {sev.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`${act.color} text-xs`}>
                            {act.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {policy.triggeredToday.toLocaleString()}
                          {policy.lastTriggered && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              Last: {policy.lastTriggered.split(' ')[1]}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Switch
                            checked={policy.enabled}
                            onCheckedChange={() => togglePolicy(policy.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
                              onClick={() => setEditingPolicy(policy)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                              onClick={() => setDeleteTarget(policy)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                        No policies match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Policy Dialog */}
      {editingPolicy && (
        <EditPolicyDialog
          policy={editingPolicy}
          onSave={savePolicy}
          onClose={() => setEditingPolicy(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <Dialog open onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Policy</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deletePolicy(deleteTarget.id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EditPolicyDialog({
  policy,
  onSave,
  onClose,
}: {
  policy: Policy;
  onSave: (p: Policy) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Policy>({ ...policy });

  function set<K extends keyof Policy>(key: K, value: Policy[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
          <DialogDescription>Modify the policy configuration below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set('category', v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={(v) => set('severity', v as Severity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Action on Trigger</Label>
            <Select value={form.action} onValueChange={(v) => set('action', v as Policy['action'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="block">Block — reject the request</SelectItem>
                <SelectItem value="flag">Flag — allow but mark for review</SelectItem>
                <SelectItem value="log">Log — record silently</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-[#0078D4] hover:bg-[#106EBE] text-white" onClick={() => onSave(form)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
