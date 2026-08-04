const ENABLED = import.meta.env.DEV;

export function logPersistence(scope, message, meta = {}) {
  if (!ENABLED) return;
  console.log(`[LIT Persist:${scope}]`, message, meta);
}

export function logPersistenceError(scope, message, meta = {}) {
  console.error(`[LIT Persist:${scope}]`, message, meta);
}

export default { logPersistence, logPersistenceError };
