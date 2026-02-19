import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Shield,
  MessageSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Menu,
  X,
  Loader2,
  Bot,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AppNavbar } from './AppNavbar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  policyCheck?: 'passed' | 'blocked' | 'flagged';
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
  model: string;
}

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o (Azure)' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Azure)' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'llama-3-70b', label: 'Llama 3 70B' },
];

const AI_RESPONSES = [
  (userMsg: string) =>
    `I've received your message: "${userMsg.substring(0, 60)}${userMsg.length > 60 ? '...' : ''}". The MCP gateway has processed this request through the policy engine, and all security checks have passed. Your interaction is encrypted with AES-256 and has been logged for audit purposes.`,
  () =>
    `Your request has been validated against the current organizational policies. The content safety filter, PII detection, and prompt injection scanner all report clean. How can I assist you further?`,
  () =>
    `I've analyzed your query through the secure AI governance layer. The policy enforcement module confirmed this interaction is compliant with all applicable security standards. Full audit trail has been generated for this session.`,
  () =>
    `Request processed successfully through the Azure AI gateway. The rate limiter, content policy, and access control checks all passed. This interaction has been logged with session ID ${Math.random().toString(36).substring(2, 10).toUpperCase()}.`,
  () =>
    `I've completed the policy validation pipeline for your request. No violations detected across data privacy, content safety, or usage policy checks. The response has been generated within your organization's approved AI governance framework.`,
];

function getInitialMessage(): Message {
  return {
    id: 'init',
    role: 'assistant',
    content:
      "Hello! I'm your secure AI agent running through the MCP gateway on Azure. All interactions are monitored, encrypted, and protected by enterprise-grade security controls. Policy enforcement and audit logging are active. How can I assist you today?",
    timestamp: new Date(),
    policyCheck: 'passed',
  };
}

function createConversation(model = 'gpt-4o'): Conversation {
  return {
    id: Date.now().toString(),
    title: 'New Conversation',
    messages: [getInitialMessage()],
    createdAt: new Date(),
    lastActivity: new Date(),
    model,
  };
}

function rehydrateConversations(raw: any[]): Conversation[] {
  return raw.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    lastActivity: new Date(c.lastActivity),
    messages: c.messages.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
  }));
}

function generateTitle(content: string): string {
  const words = content.trim().split(' ').slice(0, 6).join(' ');
  return words.length > 40 ? words.substring(0, 40) + '...' : words;
}

export function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('mcp-conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return rehydrateConversations(parsed);
        }
      }
    } catch {}
    return [createConversation()];
  });

  const [activeId, setActiveId] = useState<string>(conversations[0]?.id ?? '');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId);
  const messages = activeConv?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  useEffect(() => {
    localStorage.setItem('mcp-conversations', JSON.stringify(conversations));
  }, [conversations]);

  function updateConv(id: string, updater: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }

  function handleNewChat() {
    const model = activeConv?.model ?? 'gpt-4o';
    const newConv = createConversation(model);
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  }

  function handleDeleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fresh = createConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  }

  function handleCopyMessage(content: string, id: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  function handleChangeModel(model: string) {
    if (!activeId) return;
    updateConv(activeId, (c) => ({ ...c, model }));
  }

  async function handleSendMessage() {
    if (!inputValue.trim() || isLoading || !activeConv) return;

    const content = inputValue.trim();
    const isFirstUser = messages.filter((m) => m.role === 'user').length === 0;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      policyCheck: 'passed',
    };

    updateConv(activeId, (c) => ({
      ...c,
      messages: [...c.messages, userMessage],
      title: isFirstUser ? generateTitle(content) : c.title,
      lastActivity: new Date(),
    }));

    setInputValue('');
    setIsLoading(true);

    const delay = 900 + Math.random() * 900;
    setTimeout(() => {
      const responseFn = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseFn(content),
        timestamp: new Date(),
        policyCheck: 'passed',
      };
      updateConv(activeId, (c) => ({
        ...c,
        messages: [...c.messages, aiMessage],
        lastActivity: new Date(),
      }));
      setIsLoading(false);
    }, delay);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const selectedModel = MODELS.find((m) => m.id === (activeConv?.model ?? 'gpt-4o'));

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0 flex flex-col`}
        >
          <div className="p-3 flex flex-col gap-2 flex-shrink-0">
            <Button
              onClick={handleNewChat}
              className="w-full bg-[#0078D4] hover:bg-[#106EBE] text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider px-1">
              Conversation History
            </p>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={`group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-50 border border-[#0078D4]/30'
                      : 'hover:bg-white border border-transparent hover:border-gray-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 truncate leading-tight">{conv.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {conv.messages.length} msg · {conv.model}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Session info panel */}
          <div className="p-3 border-t border-gray-200 flex-shrink-0 space-y-2">
            <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs">
              <div className="font-medium text-gray-700 mb-2">Session Info</div>
              <div className="space-y-1.5 text-gray-500">
                <div className="flex justify-between">
                  <span>Messages</span>
                  <span className="text-gray-700 font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Encryption</span>
                  <span className="text-gray-700 font-medium">AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance</span>
                  <span className="text-green-600 font-medium">Verified</span>
                </div>
              </div>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg border border-green-100 flex gap-2 items-start">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-green-700 leading-tight">
                All security policies are active. Messages pass through policy enforcement before delivery.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chat Header */}
          <header className="border-b border-gray-200 px-5 py-3 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <div>
                <h2 className="text-base font-medium text-gray-900">
                  {activeConv?.title ?? 'Secure AI Agent'}
                </h2>
                <p className="text-xs text-gray-400">MCP Gateway · Azure Security · Policy Enforcement Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                    <Shield className="w-3 h-3 text-[#0078D4]" />
                    {selectedModel?.label ?? 'Select Model'}
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {MODELS.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => handleChangeModel(m.id)}
                      className={activeConv?.model === m.id ? 'bg-blue-50 text-[#0078D4]' : ''}
                    >
                      {m.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs h-7">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                Online
              </Badge>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 max-w-3xl mx-auto space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 bg-[#0078D4] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[72%] flex flex-col gap-1 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-[#0078D4] text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <span className="text-[11px] text-gray-400">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {message.policyCheck === 'passed' && (
                        <span className="text-[11px] text-green-500 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          Policy OK
                        </span>
                      )}
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => handleCopyMessage(message.content, message.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                      {copiedId === message.id && (
                        <span className="text-[11px] text-gray-400">Copied!</span>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-medium text-gray-600">U</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 bg-[#0078D4] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center h-4">
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '160ms' }}
                      />
                      <div
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '320ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your secure message…"
                    className="resize-none border-gray-200 rounded-xl pr-4 min-h-[56px] focus-visible:ring-[#0078D4]/40"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-[#0078D4] hover:bg-[#106EBE] text-white h-10 w-10 p-0 rounded-xl flex-shrink-0 self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Messages are encrypted end-to-end and pass through the MCP policy engine · Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
