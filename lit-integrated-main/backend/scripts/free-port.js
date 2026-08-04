import { freePort } from "../src/utils/freePort.js";

freePort(Number(process.argv[2] || 3001));
