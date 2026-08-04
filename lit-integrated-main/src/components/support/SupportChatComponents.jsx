import React from "react";
import { AdminStatusBadge } from "../admin-ui";

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SupportMessageBubble({ message, isOwn }) {
  const hasAttachment = Boolean(message.attachmentUrl);

  return (
    <div className={`lit-chat-bubble-row ${isOwn ? "lit-chat-bubble-row--own" : "lit-chat-bubble-row--other"}`}>
      <div className={`lit-chat-bubble ${isOwn ? "lit-chat-bubble--own" : "lit-chat-bubble--other"}`}>
        {!isOwn && (
          <span className="lit-chat-bubble__sender">
            {message.senderType === "ADMIN" ? "Support" : message.sender?.displayName || "You"}
          </span>
        )}
        {message.message && <p className="lit-chat-bubble__text">{message.message}</p>}
        {hasAttachment && (
          <div className="lit-chat-bubble__attachment">
            {message.attachmentType === "pdf" ? (
              <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className="lit-chat-attachment lit-chat-attachment--pdf">
                PDF Attachment
              </a>
            ) : (
              <a href={message.attachmentUrl} target="_blank" rel="noreferrer">
                <img src={message.attachmentUrl} alt="Attachment" className="lit-chat-attachment__image" />
              </a>
            )}
          </div>
        )}
        <span className="lit-chat-bubble__time">
          {formatTime(message.createdAt)}
          {isOwn && message.isRead && <span className="lit-chat-bubble__read"> · Read</span>}
        </span>
      </div>
    </div>
  );
}

export function SupportConversationListItem({ conversation, active, onClick }) {
  return (
    <button
      type="button"
      className={`lit-chat-list-item ${active ? "lit-chat-list-item--active" : ""}`}
      onClick={onClick}
    >
      <div className="lit-chat-list-item__top">
        <strong>{conversation.ticketNumber}</strong>
        <span className="lit-chat-list-item__time">{formatTime(conversation.lastMessageAt)}</span>
      </div>
      <div className="lit-chat-list-item__subject">{conversation.subject}</div>
      <div className="lit-chat-list-item__preview">{conversation.lastMessagePreview}</div>
      <div className="lit-chat-list-item__meta">
        <AdminStatusBadge status={conversation.status} />
        {conversation.unreadCount > 0 && (
          <span className="lit-chat-list-item__badge">{conversation.unreadCount}</span>
        )}
      </div>
    </button>
  );
}

export function SupportChatComposer({
  value,
  onChange,
  onSend,
  onAttach,
  sending,
  typingLabel,
  sendEmail = false,
  onToggleSendEmail,
  showEmailToggle = false,
}) {
  return (
    <div className="lit-chat-composer">
      {typingLabel && <p className="lit-chat-composer__typing">{typingLabel}</p>}
      <div className="lit-chat-composer__row">
        <label className="lit-chat-composer__attach">
          <input type="file" accept="image/*,application/pdf" hidden onChange={onAttach} />
          Attach
        </label>
        <textarea
          className="lit-chat-composer__input"
          rows={2}
          placeholder="Type your message..."
          value={value}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button type="button" className="lit-chat-composer__send" onClick={onSend} disabled={sending}>
          {sending ? "..." : "Send"}
        </button>
      </div>
      {showEmailToggle && (
        <label className="lit-chat-composer__email-toggle">
          <input type="checkbox" checked={sendEmail} onChange={(e) => onToggleSendEmail(e.target.checked)} />
          Also send email to customer
        </label>
      )}
    </div>
  );
}

export default { SupportMessageBubble, SupportConversationListItem, SupportChatComposer };
