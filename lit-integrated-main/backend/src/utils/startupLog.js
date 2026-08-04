/**
 * Pretty startup checklist logging.
 */
const steps = [];

export function startupOk(label, detail = "") {
  const line = detail ? `✓ ${label} — ${detail}` : `✓ ${label}`;
  console.log(line);
  steps.push({ label, ok: true, detail });
}

export function startupFail(label, detail = "") {
  const line = detail ? `✗ ${label} — ${detail}` : `✗ ${label}`;
  console.error(line);
  steps.push({ label, ok: false, detail });
}

export function startupWarn(label, detail = "") {
  const line = detail ? `⚠ ${label} — ${detail}` : `⚠ ${label}`;
  console.warn(line);
  steps.push({ label, ok: false, detail, warn: true });
}

export function getStartupSteps() {
  return [...steps];
}

export default { startupOk, startupFail, startupWarn, getStartupSteps };
