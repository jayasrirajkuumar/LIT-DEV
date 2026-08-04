import { AppError } from "./AppError.js";

export function withTimeout(promise, ms, message, code = "OPERATION_TIMEOUT") {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new AppError(message, 503, code));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer);
  });
}

export default withTimeout;
