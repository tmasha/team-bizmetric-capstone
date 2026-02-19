import { useState } from 'react';
import {
  Key,
  Bell,
  User,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { AppNavbar } from './AppNavbar';

function SavedIndicator({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Saved
    </span>
  );
}

export function Settings() {
  // General
  const [displayName, setDisplayName] = useState('John Doe');
  const [email] = useState('admin@contoso.com');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/Chicago');

  // API config
  const [gatewayUrl, setGatewayUrl] = useState('https://mcp-gateway.contoso.azure.com/v1');
  const [apiKey, setApiKey] = useState('sk-mcp-demo-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [requestTimeout, setRequestTimeout] = useState('30');
  const [maxTokens, setMaxTokens] = useState('4096');
  const [copiedKey, setCopiedKey] = useState(false);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [notifThreats, setNotifThreats] = useState(true);
  const [notifPolicyChanges, setNotifPolicyChanges] = useState(true);
  const [notifAuditExport, setNotifAuditExport] = useState(false);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);

  // Security
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [auditRetention, setAuditRetention] = useState('365');
  const [ipRestriction, setIpRestriction] = useState(false);

  // Save state
  const [savedSection, setSavedSection] = useState<string | null>(null);

  function handleSave(section: string) {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2500);
  }

  function copyApiKey() {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 1500);
    });
  }

  function rotateApiKey() {
    const newKey = 'sk-mcp-' + Array.from({ length: 32 }, () =>
      'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
    ).join('');
    setApiKey(newKey);
  }

  const maskedKey = apiKey.substring(0, 10) + '•'.repeat(apiKey.length - 14) + apiKey.slice(-4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 max-w-[900px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h1>
            <p className="text-sm text-gray-500">
              Manage your account, gateway configuration, and notification preferences
            </p>
          </div>

          <Tabs defaultValue="general">
            <TabsList className="mb-6 bg-white border border-gray-200 p-1">
              <TabsTrigger value="general" className="gap-2 text-sm">
                <User className="w-3.5 h-3.5" />
                General
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-2 text-sm">
                <Key className="w-3.5 h-3.5" />
                API & Gateway
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 text-sm">
                <Bell className="w-3.5 h-3.5" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 text-sm">
                <Shield className="w-3.5 h-3.5" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* ── General ── */}
            <TabsContent value="general">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile</CardTitle>
                    <CardDescription className="text-xs">Your personal account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#0078D4] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl text-white font-medium">JD</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{displayName}</div>
                        <div className="text-sm text-gray-500">{email}</div>
                        <Badge className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">Administrator</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Display Name</Label>
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Email Address</Label>
                        <Input value={email} disabled className="h-8 text-sm bg-gray-50" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Timezone</Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <SavedIndicator show={savedSection === 'profile'} />
                      <Button
                        size="sm"
                        className="bg-[#0078D4] hover:bg-[#106EBE] text-white gap-2 ml-auto"
                        onClick={() => handleSave('profile')}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Appearance</CardTitle>
                    <CardDescription className="text-xs">Interface display preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Compact Mode</div>
                        <div className="text-xs text-gray-500">Reduce spacing throughout the interface</div>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Show Policy Badges in Chat</div>
                        <div className="text-xs text-gray-500">Display policy check status on each message</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Show Session Info Sidebar</div>
                        <div className="text-xs text-gray-500">Keep session details visible by default in chat</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── API & Gateway ── */}
            <TabsContent value="api">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">MCP Gateway Configuration</CardTitle>
                    <CardDescription className="text-xs">
                      Connection settings for the MCP gateway endpoint
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gateway URL</Label>
                      <Input
                        value={gatewayUrl}
                        onChange={(e) => setGatewayUrl(e.target.value)}
                        className="h-8 text-sm font-mono"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={showApiKey ? apiKey : maskedKey}
                            onChange={(e) => showApiKey && setApiKey(e.target.value)}
                            readOnly={!showApiKey}
                            className="h-8 text-sm font-mono pr-10"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={copyApiKey}>
                          <Copy className="w-3.5 h-3.5" />
                          {copiedKey ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={rotateApiKey}>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Rotate
                        </Button>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Rotating generates a new key. Store the new key securely before navigating away.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Default Model</Label>
                        <Select value={defaultModel} onValueChange={setDefaultModel}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o (Azure)</SelectItem>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini (Azure)</SelectItem>
                            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                            <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Request Timeout (seconds)</Label>
                        <Input
                          type="number"
                          value={requestTimeout}
                          onChange={(e) => setRequestTimeout(e.target.value)}
                          className="h-8 text-sm"
                          min="5"
                          max="300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Max Output Tokens</Label>
                        <Input
                          type="number"
                          value={maxTokens}
                          onChange={(e) => setMaxTokens(e.target.value)}
                          className="h-8 text-sm"
                          min="256"
                          max="32768"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-green-800">Gateway Connected</div>
                        <div className="text-[11px] text-green-600">Latency: 8ms · Uptime: 99.97%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <SavedIndicator show={savedSection === 'api'} />
                      <Button
                        size="sm"
                        className="bg-[#0078D4] hover:bg-[#106EBE] text-white gap-2 ml-auto"
                        onClick={() => handleSave('api')}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Notifications ── */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs">
                    Choose which events trigger notifications and how you receive them
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Delivery Channels</div>
                  {[
                    { label: 'Email Notifications', desc: 'Receive alerts at admin@contoso.com', value: notifEmail, set: setNotifEmail },
                    { label: 'Browser Notifications', desc: 'Show desktop push notifications', value: notifBrowser, set: setNotifBrowser },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </div>
                        <Switch checked={item.value} onCheckedChange={item.set} />
                      </div>
                      <Separator />
                    </div>
                  ))}

                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider pt-4 mb-3">Event Types</div>
                  {[
                    { label: 'Security Threats', desc: 'Prompt injection, blocked requests, suspicious activity', value: notifThreats, set: setNotifThreats },
                    { label: 'Policy Changes', desc: 'Policy enabled, disabled, or modified by any admin', value: notifPolicyChanges, set: setNotifPolicyChanges },
                    { label: 'Audit Log Exports', desc: 'Notify when an audit log export is completed', value: notifAuditExport, set: setNotifAuditExport },
                    { label: 'Weekly Summary Report', desc: 'Weekly digest of security metrics and activity', value: notifWeeklyReport, set: setNotifWeeklyReport },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </div>
                        <Switch checked={item.value} onCheckedChange={item.set} />
                      </div>
                      <Separator />
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4">
                    <SavedIndicator show={savedSection === 'notifications'} />
                    <Button
                      size="sm"
                      className="bg-[#0078D4] hover:bg-[#106EBE] text-white gap-2 ml-auto"
                      onClick={() => handleSave('notifications')}
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Security ── */}
            <TabsContent value="security">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Authentication & Session</CardTitle>
                    <CardDescription className="text-xs">
                      Configure login security and session policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Multi-Factor Authentication</div>
                        <div className="text-xs text-gray-500">Require MFA for all login attempts</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {mfaEnabled && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Active</Badge>
                        )}
                        <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <Label className="text-xs">Session Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="h-8 text-sm w-36"
                        min="5"
                        max="480"
                      />
                      <p className="text-[11px] text-gray-400">Inactive sessions are terminated after this period.</p>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">IP Allowlist Restriction</div>
                        <div className="text-xs text-gray-500">Restrict access to approved IP ranges only</div>
                      </div>
                      <Switch checked={ipRestriction} onCheckedChange={setIpRestriction} />
                    </div>
                    {ipRestriction && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Allowed IP Ranges (CIDR)</Label>
                        <Input
                          defaultValue="10.0.0.0/8, 192.168.0.0/16"
                          className="h-8 text-sm font-mono"
                          placeholder="e.g. 10.0.0.0/8"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <SavedIndicator show={savedSection === 'security-auth'} />
                      <Button
                        size="sm"
                        className="bg-[#0078D4] hover:bg-[#106EBE] text-white gap-2 ml-auto"
                        onClick={() => handleSave('security-auth')}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Data Retention</CardTitle>
                    <CardDescription className="text-xs">Configure how long audit data is retained</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Audit Log Retention (days)</Label>
                      <Select value={auditRetention} onValueChange={setAuditRetention}>
                        <SelectTrigger className="h-8 w-48 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="730">2 years</SelectItem>
                          <SelectItem value="2555">7 years (GDPR max)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <SavedIndicator show={savedSection === 'security-retention'} />
                      <Button
                        size="sm"
                        className="bg-[#0078D4] hover:bg-[#106EBE] text-white gap-2 ml-auto"
                        onClick={() => handleSave('security-retention')}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-100">
                  <CardHeader>
                    <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
                    <CardDescription className="text-xs">Irreversible actions — proceed with caution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Clear Chat History</div>
                        <div className="text-xs text-gray-500">Delete all local conversation data from this browser</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                        onClick={() => {
                          localStorage.removeItem('mcp-conversations');
                          window.location.reload();
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
