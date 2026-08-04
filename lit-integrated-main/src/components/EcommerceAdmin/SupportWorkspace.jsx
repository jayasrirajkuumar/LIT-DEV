import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAdminSupportAdmins,
  fetchAdminSupportConversations,
  fetchAdminSupportMessages,
  fetchAdminSupportWorkspace,
  markAdminConversationRead,
  patchAdminWorkspaceAssign,
  patchAdminWorkspaceStatus,
  patchAdminSupportPriority,
  postAdminSupportEscalate,
  postAdminSupportInternalNote,
  postAdminSupportMessage,
  patchAdminWorkspaceShippingAddress,
  postAdminWorkspaceCancelOrder,
  postAdminWorkspaceRefund,
  postAdminWorkspaceApproveReturn,
  postAdminWorkspaceRejectReturn,
  postAdminWorkspaceReship,
  patchAdminWorkspaceCustomerContact,
  patchAdminConversationCustomerContact,
  uploadAdminSupportAttachment,
} from "../../services/adminApiService";
import {
  connectSupportSocket,
  disconnectSupportSocket,
  joinSupportConversation,
  emitSupportTyping,
} from "../../services/supportChatService";
import { AdminPageHeader, AdminStatusBadge, AdminInput } from "../admin-ui";
import { SupportMessageBubble } from "../support/SupportChatComponents";
import "../../styles/support-chat.css";
import "../../styles/support-workspace.css";

const STATUS_OPTIONS = [
  "OPEN",
  "WAITING_FOR_CUSTOMER",
  "WAITING_FOR_SUPPORT",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const FILTER_CHIPS = [
  { key: "", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "WAITING_FOR_CUSTOMER", label: "Waiting for Customer" },
  { key: "WAITING_FOR_SUPPORT", label: "Waiting for Support" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
  { key: "HIGH", label: "High Priority", priority: true },
];

const QUICK_REPLIES = [
  "Thank you for contacting Luxury In Taste. We're reviewing your request.",
  "We've updated your order details. Changes may take 24-48 hours to reflect.",
  "Your refund has been initiated and will be processed shortly.",
  "Could you please share your order number for faster assistance?",
  "We apologize for the inconvenience. Our team is prioritizing your case.",
];

const EMOJIS = ["👍", "🙏", "✨", "📦", "✅", "💜"];

const CANCEL_REASONS = [
  { value: "CUSTOMER_REQUEST", label: "Customer Request" },
  { value: "DUPLICATE_ORDER", label: "Duplicate Order" },
  { value: "PAYMENT_FAILED", label: "Payment Failed" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "FRAUD_DETECTION", label: "Fraud Detection" },
  { value: "OTHER", label: "Other" },
];

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(name) {
  const parts = String(name || "?").trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

function actionDisabledReason({ needsOrder, needsCustomer, permission, permissions, order, customer, loading }) {
  if (loading) return "Loading workspace details...";
  if (needsOrder && !order) {
    return "No order linked to this ticket and no customer orders found.";
  }
  if (needsCustomer && !customer?.id && !customer?.email) {
    return "Customer has no registered account (guest ticket).";
  }
  if (needsCustomer && !customer?.accountLinked && customer?.email) {
    return "No account found for this email yet. Customer must sign up with the same email.";
  }
  if (permission && permissions && permissions[permission] === false) {
    return `Your role (${permissions.tier || "unknown"}) cannot perform this action.`;
  }
  return "";
}

function ActionButton({ disabled, title, className, onClick, children }) {
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      title={disabled ? title : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function formatAddress(addr) {
  if (!addr) return "—";
  return [
    addr.fullName,
    addr.addressLine1,
    addr.addressLine2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
  ]
    .filter(Boolean)
    .join("\n");
}

function Modal({ title, children, onClose }) {
  return (
    <div className="lit-support-workspace__modal-overlay" onClick={onClose} role="presentation">
      <div className="lit-support-workspace__modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

const SupportWorkspace = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [draft, setDraft] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [typingLabel, setTypingLabel] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [modal, setModal] = useState(null);
  const messagesEndRef = useRef(null);

  const selected = conversations.find((c) => c.id === selectedId) ?? workspace?.conversation ?? null;
  const permissions = workspace?.permissions ?? {};
  const order = workspace?.order;
  const orderLinkSource = workspace?.orderLinkSource;
  const customer = workspace?.customer;
  const canUpdateContact = Boolean(
    (customer?.accountLinked || customer?.id) && permissions.canUpdateCustomer !== false,
  );

  const loadConversations = useCallback(async () => {
    const data = await fetchAdminSupportConversations({
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
    });
    setConversations(data.conversations ?? data ?? []);
  }, [filters]);

  const loadWorkspace = useCallback(async (conversationId) => {
    setWorkspaceLoading(true);
    try {
      const data = await fetchAdminSupportWorkspace(conversationId);
      setWorkspace(data);
    } catch (err) {
      setActionError(err.message || "Failed to load workspace.");
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    const data = await fetchAdminSupportMessages(conversationId);
    setMessages(data.messages ?? data ?? []);
    await markAdminConversationRead(conversationId);
    joinSupportConversation(conversationId);
  }, []);

  const refreshSelected = useCallback(async () => {
    if (!selectedId) return;
    await Promise.all([loadMessages(selectedId), loadWorkspace(selectedId), loadConversations()]);
  }, [selectedId, loadMessages, loadWorkspace, loadConversations]);

  useEffect(() => {
    setLoading(true);
    loadConversations()
      .catch((err) => setError(err.message || "Failed to load conversations."))
      .finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    fetchAdminSupportAdmins()
      .then((data) => setAdmins(Array.isArray(data) ? data : []))
      .catch(() => setAdmins([]));
  }, []);

  useEffect(() => {
    const socket = connectSupportSocket({
      "support:message:new": ({ conversationId, message, conversation }) => {
        if (conversationId === selectedId) {
          setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
          loadWorkspace(conversationId);
        }
        if (conversation) {
          setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
        }
      },
      "support:conversation:updated": ({ conversation }) => {
        if (!conversation) return;
        setConversations((prev) => [conversation, ...prev.filter((c) => c.id !== conversation.id)]);
      },
      "support:typing": ({ conversationId, displayName, isTyping }) => {
        if (conversationId !== selectedId || !isTyping) {
          setTypingLabel("");
          return;
        }
        setTypingLabel(`${displayName || "Customer"} is typing...`);
      },
    });
    return () => disconnectSupportSocket();
  }, [selectedId, loadWorkspace]);

  useEffect(() => {
    if (!selectedId) {
      setWorkspace(null);
      setMessages([]);
      return;
    }
    setActionError("");
    loadMessages(selectedId).catch((err) => setError(err.message));
    loadWorkspace(selectedId);
  }, [selectedId, loadMessages, loadWorkspace]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (attachment = null) => {
    if (!selectedId || sending) return;
    if (!draft.trim() && !attachment) return;
    try {
      setSending(true);
      const result = await postAdminSupportMessage(selectedId, {
        message: draft.trim(),
        attachmentUrl: attachment?.url ?? null,
        attachmentType: attachment?.attachmentType ?? null,
        sendEmail,
      });
      setDraft("");
      if (result.message) {
        setMessages((prev) => (prev.some((m) => m.id === result.message.id) ? prev : [...prev, result.message]));
      }
      if (result.conversation) {
        setConversations((prev) => [result.conversation, ...prev.filter((c) => c.id !== result.conversation.id)]);
      }
      await loadWorkspace(selectedId);
    } catch (err) {
      setError(err.message || "Failed to send reply.");
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
      const uploaded = await uploadAdminSupportAttachment(file);
      await handleSend(uploaded);
    } catch (err) {
      setError(err.message || "Failed to upload attachment.");
      setSending(false);
    }
  };

  const runAction = async (fn) => {
    try {
      setActionError("");
      await fn();
      await refreshSelected();
    } catch (err) {
      setActionError(err.message || "Action failed.");
    }
  };

  const handleStatusChange = (status) =>
    runAction(() => patchAdminWorkspaceStatus(selectedId, status));

  const handleAssign = (assignedToId) =>
    runAction(() => patchAdminWorkspaceAssign(selectedId, assignedToId || null));

  const applyFilterChip = (chip) => {
    if (chip.priority) {
      setFilters((p) => ({ ...p, status: "", priority: p.priority === "HIGH" ? "" : "HIGH" }));
      return;
    }
    setFilters((p) => ({
      ...p,
      status: p.status === chip.key ? "" : chip.key,
      priority: "",
    }));
  };

  const renderConversationItem = (conversation) => {
    const active = conversation.id === selectedId;
    return (
      <button
        key={conversation.id}
        type="button"
        className={`lit-support-conv-item ${active ? "lit-support-conv-item--active" : ""}`}
        onClick={() => setSelectedId(conversation.id)}
      >
        <div className="lit-support-conv-item__row">
          <div className="lit-support-conv-item__avatar">{initials(conversation.contactName)}</div>
          <div className="lit-support-conv-item__main">
            <div className="lit-support-conv-item__name">
              {conversation.contactName || conversation.user?.displayName}
            </div>
            <div className="lit-support-conv-item__meta-line">
              <span>{conversation.ticketNumber}</span>
              {conversation.orderNumber && <span>#{conversation.orderNumber}</span>}
              <span>{formatTime(conversation.lastMessageAt)}</span>
            </div>
          </div>
          {conversation.unreadCount > 0 && (
            <span className="lit-chat-list-item__badge">{conversation.unreadCount}</span>
          )}
        </div>
        <div className="lit-support-conv-item__preview">{conversation.lastMessagePreview}</div>
        <div className="lit-support-conv-item__badges">
          <span className={`lit-support-priority-badge lit-support-priority-badge--${conversation.priority}`}>
            {conversation.priority}
          </span>
          <AdminStatusBadge status={conversation.status} />
        </div>
      </button>
    );
  };

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Customer Support Workspace"
        subtitle="Manage conversations, orders, refunds, and customer actions from one screen."
      />

      <div className="lit-admin-support-toolbar">
        <AdminInput
          placeholder="Search name, ticket, order, email..."
          value={filters.search}
          onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
        />
      </div>

      {error && <p className="adm-alert adm-alert--error">{error}</p>}
      {actionError && <p className="adm-alert adm-alert--error">{actionError}</p>}

      <div className="lit-support-workspace">
        {/* LEFT PANEL */}
        <section className="lit-support-workspace__panel">
          <div className="lit-support-workspace__panel-header">
            <strong>Support Conversations</strong>
            <div className="lit-support-workspace__filters">
              {FILTER_CHIPS.map((chip) => {
                const active = chip.priority
                  ? filters.priority === "HIGH"
                  : filters.status === chip.key;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    className={`lit-support-workspace__filter-chip ${active ? "lit-support-workspace__filter-chip--active" : ""}`}
                    onClick={() => applyFilterChip(chip)}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lit-support-workspace__panel-body">
            {loading && <div className="lit-support-empty">Loading...</div>}
            {!loading && conversations.length === 0 && (
              <div className="lit-support-empty">No conversations yet.</div>
            )}
            {conversations.map(renderConversationItem)}
          </div>
        </section>

        {/* CENTER PANEL */}
        <section className="lit-support-workspace__panel">
          {!selected ? (
            <div className="lit-support-empty">Select a conversation to open the workspace.</div>
          ) : (
            <div className="lit-chat-thread">
              <div className="lit-chat-thread__header">
                <h2 style={{ margin: 0 }}>
                  {selected.ticketNumber} — {selected.subject}
                </h2>
                <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)" }}>
                  {selected.contactName} · {selected.contactEmail}
                  {selected.orderNumber ? ` · Order #${selected.orderNumber}` : ""}
                </p>
              </div>

              <div className="lit-chat-thread__messages">
                {messages.map((message) => (
                  <SupportMessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderType === "ADMIN"}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="lit-chat-composer" style={{ padding: "12px 16px" }}>
                {typingLabel && <p className="lit-chat-composer__typing">{typingLabel}</p>}
                <div className="lit-support-workspace__quick-replies">
                  {QUICK_REPLIES.map((text) => (
                    <button
                      key={text}
                      type="button"
                      className="lit-support-workspace__quick-reply"
                      onClick={() => setDraft(text)}
                    >
                      {text.slice(0, 42)}…
                    </button>
                  ))}
                </div>
                <div className="lit-support-workspace__emoji-bar">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="lit-support-workspace__emoji-btn"
                      onClick={() => setDraft((d) => `${d}${emoji}`)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="lit-chat-composer__row">
                  <label className="lit-chat-composer__attach">
                    <input type="file" accept="image/*,application/pdf" hidden onChange={handleAttach} />
                    Attach
                  </label>
                  <textarea
                    className="lit-chat-composer__input"
                    rows={2}
                    placeholder="Type your reply..."
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      emitSupportTyping(selectedId, true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="lit-chat-composer__send"
                    disabled={sending || (!draft.trim())}
                    onClick={() => handleSend()}
                  >
                    Send
                  </button>
                </div>
                <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontSize: "0.82rem" }}>
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                  />
                  Also send email notification
                </label>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT PANEL */}
        <section className="lit-support-workspace__panel">
          <div className="lit-support-workspace__panel-header">
            <strong>Customer & Order Hub</strong>
          </div>
          <div className="lit-support-workspace__panel-body">
            {workspaceLoading && <div className="lit-support-empty">Loading details...</div>}
            {!workspaceLoading && selected && (
              <>
                <div className="lit-support-workspace__section">
                  <h4 className="lit-support-workspace__section-title">Customer Information</h4>
                  <div className="lit-support-workspace__card">
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Name</span>
                      <span>{customer?.displayName || selected.contactName}</span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Email</span>
                      <span>{customer?.email || selected.contactEmail}</span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Phone</span>
                      <span>{customer?.phoneNumber || "—"}</span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Member Since</span>
                      <span>{customer?.createdAt ? formatTime(customer.createdAt) : "—"}</span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Total Orders</span>
                      <span>{customer?.totalOrders ?? 0}</span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Lifetime Spend</span>
                      <span>₹{Number(customer?.lifetimeSpend || 0).toLocaleString()}</span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Loyalty Tier</span>
                      <span>{customer?.loyaltyTier || "Bronze"}</span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Shipping</span>
                      <span style={{ whiteSpace: "pre-line", textAlign: "right" }}>
                        {formatAddress(customer?.defaultShippingAddress)}
                      </span>
                    </div>
                    <div className="lit-support-workspace__info-row">
                      <span className="lit-support-workspace__info-label">Billing</span>
                      <span style={{ whiteSpace: "pre-line", textAlign: "right" }}>
                        {formatAddress(customer?.defaultBillingAddress)}
                      </span>
                    </div>
                  </div>
                </div>

                {order && (
                  <div className="lit-support-workspace__section">
                    <h4 className="lit-support-workspace__section-title">Order Information</h4>
                    <div className="lit-support-workspace__card">
                      <div className="lit-support-workspace__info-row">
                        <span className="lit-support-workspace__info-label">Order</span>
                        <span>#{order.orderNumber}</span>
                      </div>
                      <div className="lit-support-workspace__info-row">
                        <span className="lit-support-workspace__info-label">Date</span>
                        <span>{formatTime(order.createdAt)}</span>
                      </div>
                      <div className="lit-support-workspace__info-row">
                        <span className="lit-support-workspace__info-label">Payment</span>
                        <span>{order.paymentMethod || "—"} · {order.paymentStatus}</span>
                      </div>
                      <div className="lit-support-workspace__info-row">
                        <span className="lit-support-workspace__info-label">Shipping</span>
                        <span>{order.orderStatusLabel || order.orderStatus}</span>
                      </div>
                      <div className="lit-support-workspace__info-row">
                        <span className="lit-support-workspace__info-label">Tracking</span>
                        <span>{order.trackingNumber || "—"}</span>
                      </div>
                      <div className="lit-support-workspace__info-row">
                        <span className="lit-support-workspace__info-label">Courier</span>
                        <span>{order.deliveryMethod || "Standard"}</span>
                      </div>
                      <div className="lit-support-workspace__info-row">
                        <span className="lit-support-workspace__info-label">Total</span>
                        <span>₹{Number(order.grandTotal).toLocaleString()}</span>
                      </div>
                      <div className="lit-support-workspace__product-list" style={{ marginTop: 10 }}>
                        {(order.items || []).map((item) => (
                          <div key={item.id} className="lit-support-workspace__product-item">
                            {item.image && <img src={item.image} alt="" />}
                            <div>
                              <div>{item.name}</div>
                              <div style={{ color: "rgba(255,255,255,0.5)" }}>
                                Qty {item.quantity} · ₹{item.subtotal}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="lit-support-workspace__section">
                  <h4 className="lit-support-workspace__section-title">Quick Actions</h4>
                  {!customer?.accountLinked && !customer?.id && selected?.contactEmail && (
                    <p className="lit-support-workspace__warning" style={{ marginBottom: 10 }}>
                      No registered account found for {selected.contactEmail}. Phone/email updates require a customer account with this email.
                    </p>
                  )}
                  {!order && (
                    <p className="lit-support-workspace__warning" style={{ marginBottom: 10 }}>
                      Order actions are disabled because this ticket is not linked to an order and no customer orders were found.
                    </p>
                  )}
                  {order && orderLinkSource === "latest_customer_order" && (
                    <p className="lit-support-workspace__warning" style={{ marginBottom: 10 }}>
                      Showing customer&apos;s latest order (#{order.orderNumber}). This ticket is not directly linked to an order.
                    </p>
                  )}
                  <div className="lit-support-workspace__actions">
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || !order}
                      title={actionDisabledReason({ needsOrder: true, order, customer, loading: workspaceLoading })}
                      onClick={() => order && window.open(`/admin/orders?search=${order.orderNumber}`, "_blank")}
                    >
                      View Order
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || !order || permissions.canEditAddress === false}
                      title={actionDisabledReason({
                        needsOrder: true,
                        permission: "canEditAddress",
                        permissions,
                        order,
                        customer,
                        loading: workspaceLoading,
                      })}
                      onClick={() => setModal("address")}
                    >
                      Edit Shipping Address
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || !canUpdateContact}
                      title={actionDisabledReason({
                        needsCustomer: true,
                        permission: "canUpdateCustomer",
                        permissions,
                        order,
                        customer,
                        loading: workspaceLoading,
                      })}
                      onClick={() => setModal("contact")}
                    >
                      Update Phone Number
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn lit-support-workspace__action-btn--danger"
                      disabled={workspaceLoading || !order || permissions.canCancel === false}
                      title={actionDisabledReason({
                        needsOrder: true,
                        permission: "canCancel",
                        permissions,
                        order,
                        customer,
                        loading: workspaceLoading,
                      })}
                      onClick={() => setModal("cancel")}
                    >
                      Cancel Order
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || !order || permissions.canRefund === false}
                      title={actionDisabledReason({
                        needsOrder: true,
                        permission: "canRefund",
                        permissions,
                        order,
                        customer,
                        loading: workspaceLoading,
                      })}
                      onClick={() => setModal("refund")}
                    >
                      Initiate Refund
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || !order || permissions.canManageReturns === false}
                      title={actionDisabledReason({
                        needsOrder: true,
                        permission: "canManageReturns",
                        permissions,
                        order,
                        customer,
                        loading: workspaceLoading,
                      })}
                      onClick={() => runAction(() => postAdminWorkspaceApproveReturn(order.id, { conversationId: selectedId }))}
                    >
                      Approve Return
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || !order || permissions.canManageReturns === false}
                      title={actionDisabledReason({
                        needsOrder: true,
                        permission: "canManageReturns",
                        permissions,
                        order,
                        customer,
                        loading: workspaceLoading,
                      })}
                      onClick={() => runAction(() => postAdminWorkspaceRejectReturn(order.id, { conversationId: selectedId }))}
                    >
                      Reject Return
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || !order || permissions.canReship === false}
                      title={actionDisabledReason({
                        needsOrder: true,
                        permission: "canReship",
                        permissions,
                        order,
                        customer,
                        loading: workspaceLoading,
                      })}
                      onClick={() => runAction(() => postAdminWorkspaceReship(order.id, { conversationId: selectedId, courier: order.deliveryMethod }))}
                    >
                      Reship Product
                    </ActionButton>
                    <ActionButton
                      className="lit-support-workspace__action-btn"
                      disabled={workspaceLoading || permissions.canAssign === false}
                      title={actionDisabledReason({ permission: "canAssign", permissions, order, customer, loading: workspaceLoading })}
                      onClick={() => setModal("assign")}
                    >
                      Assign Ticket
                    </ActionButton>
                    <button
                      type="button"
                      className="lit-support-workspace__action-btn"
                      onClick={() => runAction(() => postAdminSupportEscalate(selectedId))}
                    >
                      Escalate Ticket
                    </button>
                    <button
                      type="button"
                      className="lit-support-workspace__action-btn"
                      onClick={() => runAction(() => patchAdminSupportPriority(selectedId, "HIGH"))}
                    >
                      Mark High Priority
                    </button>
                    <button
                      type="button"
                      className="lit-support-workspace__action-btn"
                      onClick={() => setModal("note")}
                    >
                      Add Internal Notes
                    </button>
                    <button
                      type="button"
                      className="lit-support-workspace__action-btn"
                      onClick={() => handleStatusChange("CLOSED")}
                    >
                      Close Ticket
                    </button>
                    <button
                      type="button"
                      className="lit-support-workspace__action-btn"
                      onClick={() => handleStatusChange("OPEN")}
                    >
                      Reopen Ticket
                    </button>
                  </div>
                </div>

                <div className="lit-support-workspace__section">
                  <h4 className="lit-support-workspace__section-title">Internal Notes</h4>
                  {(workspace?.internalNotes || []).length === 0 && (
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>No internal notes yet.</p>
                  )}
                  {(workspace?.internalNotes || []).map((note) => (
                    <div key={note.id} className="lit-support-workspace__note">
                      <div>{note.note}</div>
                      <div className="lit-support-workspace__timeline-time">
                        {note.admin?.displayName || "Admin"} · {formatTime(note.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lit-support-workspace__section">
                  <h4 className="lit-support-workspace__section-title">Customer Timeline</h4>
                  <div className="lit-support-workspace__timeline">
                    {(workspace?.timeline || []).map((event) => (
                      <div
                        key={event.id}
                        className={`lit-support-workspace__timeline-item ${event.internal ? "lit-support-workspace__timeline-item--internal" : ""}`}
                      >
                        <strong>{event.label}</strong>
                        <span className="lit-support-workspace__timeline-time">{formatTime(event.at)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lit-support-workspace__section">
                  <h4 className="lit-support-workspace__section-title">Activity Log</h4>
                  <div className="lit-support-workspace__timeline">
                    {(workspace?.activityLog || []).slice(0, 15).map((log) => (
                      <div key={log.id} className="lit-support-workspace__timeline-item">
                        <strong>{log.message}</strong>
                        <span className="lit-support-workspace__timeline-time">
                          {log.admin?.displayName || "System"} · {formatTime(log.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {modal === "address" && order && (
        <AddressModal
          order={order}
          onClose={() => setModal(null)}
          onSave={(payload) =>
            runAction(async () => {
              await patchAdminWorkspaceShippingAddress(order.id, {
                ...payload,
                conversationId: selectedId,
              });
              setModal(null);
            })
          }
        />
      )}

      {modal === "cancel" && order && (
        <CancelModal
          onClose={() => setModal(null)}
          onConfirm={(payload) =>
            runAction(async () => {
              await postAdminWorkspaceCancelOrder(order.id, {
                ...payload,
                conversationId: selectedId,
              });
              setModal(null);
            })
          }
        />
      )}

      {modal === "refund" && order && (
        <RefundModal
          order={order}
          onClose={() => setModal(null)}
          onConfirm={(payload) =>
            runAction(async () => {
              await postAdminWorkspaceRefund(order.id, {
                ...payload,
                conversationId: selectedId,
              });
              setModal(null);
            })
          }
        />
      )}

      {modal === "note" && (
        <NoteModal
          onClose={() => setModal(null)}
          onSave={(note) =>
            runAction(async () => {
              await postAdminSupportInternalNote(selectedId, note);
              setModal(null);
            })
          }
        />
      )}

      {modal === "contact" && selectedId && (
        <ContactModal
          customer={{
            id: customer?.id,
            email: customer?.email || selected?.contactEmail,
            phoneNumber: customer?.phoneNumber || "",
          }}
          onClose={() => setModal(null)}
          onSave={(payload) =>
            runAction(async () => {
              await patchAdminConversationCustomerContact(selectedId, payload);
              setModal(null);
            })
          }
        />
      )}

      {modal === "assign" && (
        <AssignModal
          admins={admins}
          current={selected?.assignedTo?.id}
          onClose={() => setModal(null)}
          onSave={(assignedToId) => {
            handleAssign(assignedToId);
            setModal(null);
          }}
        />
      )}
    </div>
  );
};

function AddressModal({ order, onClose, onSave }) {
  const addr = order.shippingAddress || {};
  const [form, setForm] = useState({
    fullName: addr.fullName || "",
    phone: addr.phone || "",
    addressLine1: addr.addressLine1 || "",
    addressLine2: addr.addressLine2 || "",
    city: addr.city || "",
    state: addr.state || "",
    country: addr.country || "",
    postalCode: addr.postalCode || "",
  });
  const shipped = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus);

  return (
    <Modal title="Edit Shipping Address" onClose={onClose}>
      {shipped && (
        <div className="lit-support-workspace__warning">
          This order has already shipped. Address changes may not reach the courier.
        </div>
      )}
      <div className="lit-support-workspace__form-grid">
        {["fullName", "phone", "addressLine1", "addressLine2", "city", "state", "country", "postalCode"].map((field) => (
          <label key={field}>
            {field.replace(/([A-Z])/g, " $1")}
            <input
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
            />
          </label>
        ))}
      </div>
      <div className="lit-support-workspace__modal-actions">
        <button type="button" className="lit-support-workspace__action-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="lit-support-workspace__action-btn" onClick={() => onSave(form)}>Save Changes</button>
      </div>
    </Modal>
  );
}

function CancelModal({ onClose, onConfirm }) {
  const [reasonCode, setReasonCode] = useState("CUSTOMER_REQUEST");
  const [reasonText, setReasonText] = useState("");
  return (
    <Modal title="Cancel Order" onClose={onClose}>
      <div className="lit-support-workspace__form-grid">
        <label>
          Reason
          <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}>
            {CANCEL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        <label>
          Notes
          <textarea rows={3} value={reasonText} onChange={(e) => setReasonText(e.target.value)} />
        </label>
      </div>
      <div className="lit-support-workspace__modal-actions">
        <button type="button" className="lit-support-workspace__action-btn" onClick={onClose}>Back</button>
        <button
          type="button"
          className="lit-support-workspace__action-btn lit-support-workspace__action-btn--danger"
          onClick={() => onConfirm({ reasonCode, reasonText })}
        >
          Confirm Cancellation
        </button>
      </div>
    </Modal>
  );
}

function RefundModal({ order, onClose, onConfirm }) {
  const [refundType, setRefundType] = useState("FULL");
  const [amount, setAmount] = useState(order.grandTotal);
  const [reason, setReason] = useState("");
  return (
    <Modal title="Initiate Refund" onClose={onClose}>
      <div className="lit-support-workspace__card" style={{ marginBottom: 12 }}>
        <div className="lit-support-workspace__info-row">
          <span>Order Total</span>
          <span>₹{Number(order.grandTotal).toLocaleString()}</span>
        </div>
        <div className="lit-support-workspace__info-row">
          <span>Payment Method</span>
          <span>{order.paymentMethod || "—"}</span>
        </div>
      </div>
      <div className="lit-support-workspace__form-grid">
        <label>
          Refund Type
          <select value={refundType} onChange={(e) => setRefundType(e.target.value)}>
            <option value="FULL">Full</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </label>
        {refundType === "PARTIAL" && (
          <label>
            Amount
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
        )}
        <label>
          Reason
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
      </div>
      <div className="lit-support-workspace__modal-actions">
        <button type="button" className="lit-support-workspace__action-btn" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="lit-support-workspace__action-btn"
          onClick={() => onConfirm({ refundType, amount: Number(amount), reason })}
        >
          Submit Refund
        </button>
      </div>
    </Modal>
  );
}

function NoteModal({ onClose, onSave }) {
  const [note, setNote] = useState("");
  return (
    <Modal title="Add Internal Note" onClose={onClose}>
      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginTop: 0 }}>
        Customers cannot see internal notes.
      </p>
      <textarea
        rows={5}
        style={{ width: "100%" }}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. VIP customer, refund approved by manager..."
      />
      <div className="lit-support-workspace__modal-actions">
        <button type="button" className="lit-support-workspace__action-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="lit-support-workspace__action-btn" onClick={() => onSave(note)}>Save Note</button>
      </div>
    </Modal>
  );
}

function ContactModal({ customer, onClose, onSave }) {
  const [email, setEmail] = useState(customer.email || "");
  const [phoneNumber, setPhoneNumber] = useState(customer.phoneNumber || "");
  return (
    <Modal title="Update Phone Number" onClose={onClose}>
      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", marginTop: 0 }}>
        Updates the customer account linked to this ticket email.
      </p>
      <div className="lit-support-workspace__form-grid">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Phone Number
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 9876543210" />
        </label>
      </div>
      <div className="lit-support-workspace__modal-actions">
        <button type="button" className="lit-support-workspace__action-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="lit-support-workspace__action-btn" onClick={() => onSave({ email, phoneNumber })}>Save</button>
      </div>
    </Modal>
  );
}

function AssignModal({ admins, current, onClose, onSave }) {
  const [assignedToId, setAssignedToId] = useState(current || "");
  return (
    <Modal title="Assign Ticket" onClose={onClose}>
      <select
        value={assignedToId}
        onChange={(e) => setAssignedToId(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 10 }}
      >
        <option value="">Unassigned</option>
        {admins.map((admin) => (
          <option key={admin.id} value={admin.id}>{admin.displayName || admin.email}</option>
        ))}
      </select>
      <div className="lit-support-workspace__modal-actions">
        <button type="button" className="lit-support-workspace__action-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="lit-support-workspace__action-btn" onClick={() => onSave(assignedToId || null)}>Assign</button>
      </div>
    </Modal>
  );
}

export default SupportWorkspace;
