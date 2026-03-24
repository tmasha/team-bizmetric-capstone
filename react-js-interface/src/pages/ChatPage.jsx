import React, { useState } from 'react';
import { CheckCircle2, Menu, Send, Shield, X } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello. I am your secure AI agent. All interactions are validated against policy and written to audit logs.',
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function sendMessage() {
    if (!input.trim()) return;

    const userMessage = {
      id: `${Date.now()}`,
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-reply`,
          role: 'assistant',
          content:
            'Request processed securely. Policy checks passed, and the event has been logged for compliance review.',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }, 500);
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-layout">
      <aside className={sidebarOpen ? 'chat-sidebar open' : 'chat-sidebar'}>
        <div className="sidebar-block">
          <h3>Conversation History</h3>
          <button className="list-item" type="button">
            <strong>New Chat</strong>
            <span>Start a secure conversation</span>
          </button>
          <button className="list-item active" type="button">
            <strong>Current Session</strong>
            <span>Active now</span>
          </button>
        </div>
        <div className="session-card">
          <h4>Session Info</h4>
          <p>
            <span>Messages</span>
            <strong>{messages.length}</strong>
          </p>
          <p>
            <span>Status</span>
            <strong className="ok">Active</strong>
          </p>
          <p>
            <span>Encryption</span>
            <strong>AES-256</strong>
          </p>
          <p>
            <span>Compliance</span>
            <strong className="ok">Verified</strong>
          </p>
        </div>
        <div className="policy-ok">
          <strong>
            <CheckCircle2 size={14} />
            All Policies Active
          </strong>
          <span>Your messages are monitored and protected.</span>
        </div>
      </aside>

      <section className="chat-main">
        <div className="chat-header">
          <div>
            <h2>Secure AI Agent</h2>
            <p>Protected by Azure Security</p>
          </div>
          <div className="chat-header-actions">
            <span className="online-pill">Online</span>
            <button className="button subtle" onClick={() => setSidebarOpen((v) => !v)} type="button">
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
              <span>{sidebarOpen ? 'Hide Panel' : 'Show Panel'}</span>
            </button>
          </div>
        </div>

        <div className="messages">
          {messages.map((message) => (
            <article key={message.id} className={message.role === 'user' ? 'message-row user' : 'message-row'}>
              {message.role === 'assistant' && (
                <span className="avatar assistant-avatar">
                  <Shield size={14} />
                </span>
              )}
              <div className={message.role === 'user' ? 'message user' : 'message assistant'}>
                <p>{message.content}</p>
                <time>{message.time}</time>
              </div>
              {message.role === 'user' && <span className="avatar user-avatar">U</span>}
            </article>
          ))}
        </div>

        <div className="composer">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Type your secure message"
          />
          <button className="button primary" onClick={sendMessage} type="button">
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
        <p className="compliance-note">All messages are encrypted and logged for compliance.</p>
      </section>
    </div>
  );
}
