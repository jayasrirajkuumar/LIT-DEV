const HTML_TAG_RE = /<[^>]*>/g;

export function sanitizeSupportText(value, maxLength = 5000) {
  if (typeof value !== "string") return "";
  return value
    .replace(HTML_TAG_RE, "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

export function deriveSubjectFromMessage(message, fallback = "Contact Us Inquiry") {
  const cleaned = sanitizeSupportText(message, 5000);
  const firstLine = cleaned.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";
  const subject = firstLine.slice(0, 255);
  return subject || fallback;
}

export function formatTicketNumber(sequence) {
  return `LIT-${String(sequence).padStart(6, "0")}`;
}

export function parseTicketSequence(ticketNumber) {
  const match = String(ticketNumber || "").match(/^LIT-(\d+)$/i);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export function formatStatusLabel(status) {
  return String(status || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default {
  sanitizeSupportText,
  deriveSubjectFromMessage,
  formatTicketNumber,
  parseTicketSequence,
  formatStatusLabel,
};
