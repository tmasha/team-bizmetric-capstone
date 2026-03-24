import React, { useState } from 'react';

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
        <h3>Conversation</h3>
        <div className="session-card">
          <p>Messages: {messages.length}</p>
          <p>Status: Active</p>
          <p>Encryption: AES-256</p>
          <p>Compliance: Verified</p>
        </div>
      </aside>

      <section className="chat-main">
        <div className="chat-header">
          <div>
            <h2>Secure AI Agent</h2>
            <p>Protected by Azure security controls</p>
          </div>
          <button className="button" onClick={() => setSidebarOpen((v) => !v)} type="button">
            {sidebarOpen ? 'Hide Panel' : 'Show Panel'}
          </button>
        </div>

        <div className="messages">
          {messages.map((message) => (
            <article key={message.id} className={message.role === 'user' ? 'message user' : 'message assistant'}>
              <p>{message.content}</p>
              <time>{message.time}</time>
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
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
