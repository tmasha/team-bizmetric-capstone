import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Send, 
  Shield,
  MessageSquare, 
  Settings, 
  BarChart3,
  Home,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { AppNavbar } from './AppNavbar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your secure AI agent running on Azure. All interactions are monitored and protected by enterprise-grade security controls. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'ve processed your request securely. All policies have been validated, and this interaction has been logged for audit purposes. Your query complies with organizational security standards.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-sm text-gray-900 mb-3">Conversation History</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-[#0078D4] transition-colors">
                    <div className="text-sm text-gray-900 mb-1">New Chat</div>
                    <div className="text-xs text-gray-500">Start a secure conversation</div>
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-blue-50 rounded-lg border border-[#0078D4]">
                    <div className="text-sm text-gray-900 mb-1">Current Session</div>
                    <div className="text-xs text-gray-500">Active now</div>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-900 mb-3">Session Info</div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Messages:</span>
                      <span className="text-gray-900">{messages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Encryption:</span>
                      <span className="text-gray-900">AES-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compliance:</span>
                      <span className="text-green-600">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-green-900 mb-1">All Policies Active</div>
                      <div className="text-xs text-green-700">
                        Your messages are monitored and protected
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h2 className="text-lg text-gray-900">Secure AI Agent</h2>
                <p className="text-sm text-gray-500">Protected by Azure Security</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Online
              </div>
            </div>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1">
            <div className="px-6 py-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-[#0078D4] rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-[#0078D4] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-gray-700">U</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your secure message..."
                  className="resize-none min-h-[60px] border-gray-300"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-[#0078D4] hover:bg-[#106EBE] text-white self-end"
                  size="lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                All messages are encrypted and logged for compliance. Press Enter to send.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}