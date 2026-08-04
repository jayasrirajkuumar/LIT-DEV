import nodemailer from "nodemailer";
import config from "../config/env.js";
import { logger } from "../utils/logger.js";
import { formatStatusLabel } from "../utils/supportHelpers.js";

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [5_000, 30_000, 120_000];
const pendingRetries = [];

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.email.enabled) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: config.email.smtpSecure,
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
    auth: config.email.smtpUser
      ? {
          user: config.email.smtpUser,
          pass: config.email.smtpPass,
        }
      : undefined,
  });

  return transporter;
}

function scheduleRetry(job, attempt) {
  if (attempt >= MAX_RETRIES) {
    logger.error("Email delivery failed after retries", {
      to: job.to,
      subject: job.subject,
      attempts: attempt,
    });
    return;
  }

  const delay = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
  const timeoutId = setTimeout(() => {
    pendingRetries.splice(pendingRetries.indexOf(timeoutId), 1);
    sendMailInternal(job, attempt + 1).catch(() => {});
  }, delay);

  pendingRetries.push(timeoutId);
  logger.warn("Email delivery scheduled for retry", {
    to: job.to,
    subject: job.subject,
    attempt: attempt + 1,
    delayMs: delay,
  });
}

async function sendMailInternal(job, attempt = 0) {
  const transport = getTransporter();

  if (!transport) {
    logger.info("Email (SMTP not configured — logged only)", {
      to: job.to,
      subject: job.subject,
      textPreview: job.text?.slice(0, 200),
    });
    return { sent: false, loggedOnly: true };
  }

  try {
    await transport.sendMail({
      from: config.email.from,
      to: job.to,
      subject: job.subject,
      text: job.text,
      html: job.html,
      replyTo: job.replyTo,
    });
    logger.info("Email sent", { to: job.to, subject: job.subject });
    return { sent: true };
  } catch (error) {
    logger.error("Email send failed", {
      to: job.to,
      subject: job.subject,
      attempt,
      message: error.message,
    });
    scheduleRetry(job, attempt);
    return { sent: false, error: error.message };
  }
}

export async function sendMail(job) {
  return sendMailInternal(job, 0);
}

export async function sendSupportTeamNotification(ticket) {
  const createdAt = new Date(ticket.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const text = [
    "A new support ticket has been submitted.",
    "",
    `Ticket Number: ${ticket.ticketNumber}`,
    `Customer Name: ${ticket.contactName}`,
    `Customer Email: ${ticket.contactEmail}`,
    `Subject: ${ticket.subject}`,
    `Category: ${ticket.category || "—"}`,
    `Message:`,
    ticket.message,
    "",
    `Date & Time: ${createdAt}`,
  ].join("\n");

  return sendMail({
    to: config.email.supportInbox,
    subject: `New Support Ticket - ${ticket.ticketNumber}`,
    text,
    replyTo: ticket.contactEmail,
  });
}

export async function sendCustomerAcknowledgment(ticket) {
  const text = [
    `Hello ${ticket.contactName},`,
    "",
    "Thank you for contacting Luxury In Taste.",
    "",
    "Your support request has been received successfully.",
    "",
    "Ticket Number:",
    ticket.ticketNumber,
    "",
    "Our team will review your request and respond as soon as possible.",
    "",
    "Regards,",
    "Luxury In Taste Support",
    config.email.supportInbox,
  ].join("\n");

  return sendMail({
    to: ticket.contactEmail,
    subject: "We've received your support request",
    text,
    replyTo: config.email.supportInbox,
  });
}

export async function sendCustomerStatusUpdate(ticket, previousStatus) {
  if (previousStatus === ticket.status) return { skipped: true };

  const text = [
    `Hello ${ticket.contactName},`,
    "",
    `Your support ticket #${ticket.ticketNumber} has been updated.`,
    "",
    "Status:",
    formatStatusLabel(ticket.status),
    "",
    "If you have further questions, reply to this email or contact us at",
    config.email.supportInbox,
    "",
    "Regards,",
    "Luxury In Taste Support",
  ].join("\n");

  return sendMail({
    to: ticket.contactEmail,
    subject: `Support ticket ${ticket.ticketNumber} updated`,
    text,
    replyTo: config.email.supportInbox,
  });
}

export const emailService = {
  sendMail,
  sendSupportTeamNotification,
  sendCustomerAcknowledgment,
  sendCustomerStatusUpdate,
};

export default emailService;
