import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Send, Shield } from 'lucide-react';
import { apiFetch } from '../lib/api';

const domains = ['demo', 'finance', 'ops', 'hr'];

function createAssistantMessage(content, extras = {}) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    content,
    time: new Date().toLocaleTimeString(),
    ...extras,
  };
}

function createUserMessage(content) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'user',
    content,
    time: new Date().toLocaleTimeString(),
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    createAssistantMessage(
      'Hello. I am your secure AI agent. All interactions are validated against policy and written to audit logs.'
    ),
  ]);
  const [input, setInput] = useState('');
  const [domain, setDomain] = useState('demo');
  const [sessionId, setSessionId] = useState(null);
  const [toolAccess, setToolAccess] = useState({ allowedTools: [], restrictedTools: [] });
  const [auditCount, setAuditCount] = useState(0);
  const [requestState, setRequestState] = useState({ loading: false, error: '' });
  const [lastPolicy, setLastPolicy] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadTools() {
      try {
        const response = await apiFetch(`/api/tools?domain=${domain}`);
        if (active) {
          setToolAccess({
            allowedTools: response.allowedTools || [],
            restrictedTools: response.restrictedTools || [],
          });
        }
      } catch (error) {
        if (active) {
          setRequestState((previous) => ({ ...previous, error: error.message }));
        }
      }
    }

    loadTools();

    return () => {
      active = false;
    };
  }, [domain]);

  const visibleStatus = useMemo(() => {
    if (!lastPolicy) {
      return { title: 'All Policies Active', body: 'Your messages are monitored and protected.', tone: 'ok' };
    }

    if (lastPolicy.decision === 'blocked') {
      return {
        title: 'Request Blocked',
        body: lastPolicy.policyReason,
        tone: 'danger',
      };
    }

    if (lastPolicy.decision === 'review_required') {
      return {
        title: 'Review Required',
        body: lastPolicy.policyReason,
        tone: 'warning',
      };
    }

    return {
      title: 'Policy Approved',
      body: lastPolicy.policyReason,
      tone: 'ok',
    };
  }, [lastPolicy]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || requestState.loading) return;

    const userMessage = createUserMessage(trimmed);
    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setRequestState({ loading: true, error: '' });

    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          message: trimmed,
          domain,
        }),
      });

      setSessionId(response.sessionId);
      setLastPolicy(response.policySummary);
      setAuditCount((previous) => previous + (response.auditEventIds?.length || 0));
      setToolAccess({
        allowedTools: response.policySummary?.allowedTools || [],
        restrictedTools: response.policySummary?.restrictedTools || [],
      });
      setMessages((previous) => [
        ...previous,
        createAssistantMessage(response.assistantMessage, {
          decision: response.decision,
          requestedTool: response.policySummary?.requestedTool,
          policyReason: response.policySummary?.policyReason,
        }),
      ]);
      setRequestState({ loading: false, error: '' });
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        createAssistantMessage(`The secure backend returned an error: ${error.message}`, {
          decision: 'blocked',
          policyReason: error.message,
        }),
      ]);
      setRequestState({ loading: false, error: error.message });
    }
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function resetConversation() {
    setMessages([
      createAssistantMessage(
        'New secure session started. Requests will be checked against role, domain, and tool policy before execution.'
      ),
    ]);
    setSessionId(null);
    setAuditCount(0);
    setLastPolicy(null);
    setRequestState({ loading: false, error: '' });
  }

  return (
    <div className="chat-layout">
      <aside className="chat-sidebar open">
        <div className="sidebar-block">
          <h3>Conversation History</h3>
          <button className="list-item" type="button" onClick={resetConversation}>
            <strong>New Chat</strong>
            <span>Start a secure conversation</span>
          </button>
          <button className="list-item active" type="button">
            <strong>Current Session</strong>
            <span>{sessionId ? `Session ${sessionId.slice(0, 8)}` : 'Waiting for first request'}</span>
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
            <strong className="ok">{requestState.loading ? 'Evaluating' : 'Active'}</strong>
          </p>
          <p>
            <span>Domain</span>
            <strong>{domain}</strong>
          </p>
          <p>
            <span>Audit Events</span>
            <strong>{auditCount}</strong>
          </p>
          <label className="field-label" htmlFor="domain-select">
            Active Domain
          </label>
          <select
            id="domain-select"
            className="domain-select"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          >
            {domains.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className={`policy-ok ${visibleStatus.tone !== 'ok' ? `policy-${visibleStatus.tone}` : ''}`}>
          <strong>
            {visibleStatus.tone === 'danger' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {visibleStatus.title}
          </strong>
          <span>{visibleStatus.body}</span>
        </div>

        <div className="session-card">
          <h4>Allowed Tools</h4>
          <div className="tools-list">
            {toolAccess.allowedTools.length ? (
              toolAccess.allowedTools.map((tool) => (
                <div key={tool.name} className="tool-item">
                  <strong>{tool.name}</strong>
                  <span>{tool.server}</span>
                </div>
              ))
            ) : (
              <p className="tool-empty">No tool access available for the current role and domain.</p>
            )}
          </div>
        </div>

        <div className="session-card">
          <h4>Restricted Tools</h4>
          <div className="tools-list">
            {toolAccess.restrictedTools.length ? (
              toolAccess.restrictedTools.map((tool) => (
                <div key={tool.name} className="tool-item restricted">
                  <strong>{tool.name}</strong>
                  <span>{tool.reason}</span>
                </div>
              ))
            ) : (
              <p className="tool-empty">No restrictions returned for this domain.</p>
            )}
          </div>
        </div>
      </aside>

      <section className="chat-main">
        <div className="chat-header">
          <div>
            <h2>Secure AI Agent</h2>
            <p>Protected by Flask policy orchestration and Azure-ready gateway headers</p>
          </div>
          <div className="chat-header-actions">
            <span className="online-pill">{requestState.loading ? 'Checking policy' : 'Online'}</span>
          </div>
        </div>

        {requestState.error ? (
          <div className="error-banner">
            <AlertTriangle size={16} />
            <span>{requestState.error}</span>
          </div>
        ) : null}

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
                {message.role === 'assistant' && message.decision ? (
                  <div className="message-meta">
                    <span className={`message-status ${message.decision}`}>{message.decision.replace('_', ' ')}</span>
                    {message.requestedTool ? <span>Tool: {message.requestedTool}</span> : null}
                    {message.policyReason ? <span>{message.policyReason}</span> : null}
                  </div>
                ) : null}
                <time>{message.time}</time>
              </div>
              {message.role === 'user' && <span className="avatar user-avatar">U</span>}
            </article>
          ))}

          {requestState.loading ? (
            <article className="message-row">
              <span className="avatar assistant-avatar">
                <Shield size={14} />
              </span>
              <div className="message assistant">
                <p>Evaluating policy, selecting allowed tools, and writing audit events...</p>
              </div>
            </article>
          ) : null}
        </div>

        <div className="composer">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Type your secure message"
          />
          <div className="composer-controls">
            <button className="button outline" onClick={resetConversation} type="button">
              Reset
            </button>
            <button className="button primary" onClick={sendMessage} type="button" disabled={requestState.loading}>
              <Send size={16} />
              <span>Send</span>
            </button>
          </div>
        </div>
        <p className="compliance-note">
          All requests are domain-scoped, policy-evaluated, and stored with audit metadata for compliance review.
        </p>
      </section>
    </div>
  );
}
