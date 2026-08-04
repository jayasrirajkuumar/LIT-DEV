import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { AdminStatusBadge } from "../components/admin-ui";
import {
  SupportChatComposer,
  SupportConversationListItem,
  SupportMessageBubble,
} from "../components/support/SupportChatComponents";
import {
  connectSupportSocket,
  createConversation,
  disconnectSupportSocket,
  emitSupportTyping,
  fetchConversationMessages,
  fetchUserConversations,
  joinSupportConversation,
  markConversationRead,
  sendConversationMessage,
  uploadSupportAttachment,
} from "../services/supportChatService";
import "../styles/support-chat.css";

const SupportCenter = () => {
  const { isAuthenticated } = useUserAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [typingLabel, setTypingLabel] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchUserConversations();
      setConversations(data);
      setError("");
      return data;
    } catch (err) {
      const message = err.message || "Failed to load conversations.";
      if (message.includes("not found") || message.includes("USER_NOT_FOUND")) {
        setError("Your account is not synced yet. Please sign out and sign in again.");
      } else {
        setError(message);
      }
      throw err;
    }
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    const data = await fetchConversationMessages(conversationId);
    setMessages(data);
    await markConversationRead(conversationId);
    joinSupportConversation(conversationId);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    loadConversations().catch(() => {}).finally(() => mounted && setLoading(false));

    const socket = connectSupportSocket({
      "support:message:new": ({ conversationId, message, conversation }) => {
        if (conversationId === selectedId) {
          setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        }
        if (conversation) {
          setConversations((prev) => {
            const next = prev.filter((c) => c.id !== conversation.id);
            return [conversation, ...next];
          });
        }
      },
      "support:conversation:updated": ({ conversation }) => {
        if (!conversation) return;
        setConversations((prev) => {
          const next = prev.filter((c) => c.id !== conversation.id);
          return [conversation, ...next];
        });
      },
      "support:typing": ({ conversationId, displayName, isTyping }) => {
        if (conversationId !== selectedId || !isTyping) {
          setTypingLabel("");
          return;
        }
        setTypingLabel(`${displayName || "Support"} is typing...`);
      },
    });

    return () => {
      mounted = false;
      disconnectSupportSocket();
    };
  }, [isAuthenticated, loadConversations, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId).catch((err) => setError(err.message));
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setShowNewForm(false);
    setError("");
  };

  const handleSend = async (attachment = null) => {
    if (!selectedId || sending) return;
    if (!draft.trim() && !attachment) return;

    try {
      setSending(true);
      const result = await sendConversationMessage(selectedId, {
        message: draft.trim(),
        attachmentUrl: attachment?.url ?? null,
        attachmentType: attachment?.attachmentType ?? null,
      });
      setDraft("");
      if (result.message) {
        setMessages((prev) => (prev.some((m) => m.id === result.message.id) ? prev : [...prev, result.message]));
      }
      if (result.conversation) {
        setConversations((prev) => [result.conversation, ...prev.filter((c) => c.id !== result.conversation.id)]);
      }
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleAttach = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedId) return;
    try {
      setSending(true);
      const uploaded = await uploadSupportAttachment(file);
      await handleSend(uploaded);
    } catch (err) {
      setError(err.message || "Failed to upload attachment.");
      setSending(false);
    }
  };

  const handleDraftChange = (event) => {
    setDraft(event.target.value);
    if (!selectedId) return;
    emitSupportTyping(selectedId, true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitSupportTyping(selectedId, false), 1200);
  };

  const handleCreateConversation = async () => {
    if (!newMessage.trim()) return;
    try {
      setSending(true);
      const result = await createConversation({ message: newMessage.trim() });
      setNewMessage("");
      setShowNewForm(false);
      setError("");
      await loadConversations();
      const conversationId = result.conversation?.id;
      if (conversationId) setSelectedId(conversationId);
    } catch (err) {
      setError(err.message || "Failed to start conversation.");
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="lit-support-center">
        <div className="lit-support-login-prompt">
          <h1>Support Center</h1>
          <p>Sign in to chat with our support team, view ticket history, and get real-time help.</p>
          <Link to="/sign-in" className="lit-support-new-btn" style={{ display: "inline-block", marginTop: 16 }}>
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lit-support-center">
      <div className="lit-support-center__header">
        <h1 className="lit-support-center__title">Support Center</h1>
        <p className="lit-support-center__subtitle">Chat with Luxury In Taste support in real time.</p>
      </div>

      {error && <p className="adm-alert adm-alert--error" style={{ maxWidth: 1200, margin: "0 auto 12px" }}>{error}</p>}

      <div className={`lit-support-layout ${selectedId ? "lit-support-layout--mobile-hide-list" : ""}`}>
        <section className="lit-support-panel lit-support-panel--list">
          <div className="lit-support-panel__header">
            <strong>Conversations</strong>
            <button type="button" className="lit-support-new-btn" onClick={() => setShowNewForm((v) => !v)}>
              New
            </button>
          </div>
          <div className="lit-support-panel__body">
            {showNewForm && (
              <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <textarea
                  className="lit-chat-composer__input"
                  rows={3}
                  placeholder="Describe your issue..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="button" className="lit-support-new-btn" style={{ marginTop: 10 }} onClick={handleCreateConversation} disabled={sending}>
                  Start Conversation
                </button>
              </div>
            )}
            {loading && <div className="lit-support-empty">Loading conversations...</div>}
            {!loading && conversations.length === 0 && (
              <div className="lit-support-empty">No conversations yet. Start a new one.</div>
            )}
            {conversations.map((conversation) => (
              <SupportConversationListItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === selectedId}
                onClick={() => handleSelect(conversation.id)}
              />
            ))}
          </div>
        </section>

        <section className={`lit-support-panel lit-support-panel--chat ${!selectedId ? "lit-support-layout--mobile-hide-chat" : ""}`}>
          {!selected ? (
            <div className="lit-support-empty">Select a conversation or start a new one.</div>
          ) : (
            <div className="lit-chat-thread">
              <div className="lit-chat-thread__header">
                <h2 style={{ margin: 0 }}>{selected.ticketNumber}</h2>
                <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)" }}>{selected.subject}</p>
                <div style={{ marginTop: 8 }}>
                  <AdminStatusBadge status={selected.status} />
                </div>
              </div>

              <div className="lit-chat-thread__messages">
                {messages.map((message) => (
                  <SupportMessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderType === "CUSTOMER"}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <SupportChatComposer
                value={draft}
                onChange={handleDraftChange}
                onSend={() => handleSend()}
                onAttach={handleAttach}
                sending={sending}
                typingLabel={typingLabel}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SupportCenter;
