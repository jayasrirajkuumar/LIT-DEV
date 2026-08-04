import { execSync } from "child_process";

export function freePort(targetPort, { excludePid = process.pid } = {}) {
  if (process.platform !== "win32") return;

  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: "utf8" });
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = Number(parts[parts.length - 1]);
      if (pid && pid !== 0 && pid !== excludePid) pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`[free-port] Freed port ${targetPort} (stopped PID ${pid})`);
      } catch {
        // already exited
      }
    }
  } catch {
    // port already free
  }
}

export default freePort;
