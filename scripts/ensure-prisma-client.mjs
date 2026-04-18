import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const clientDir = path.join(process.cwd(), "node_modules", ".prisma", "client");
const hasGeneratedClient =
  existsSync(path.join(clientDir, "default.js")) &&
  readdirSync(clientDir, { withFileTypes: true }).some(
    (entry) =>
      entry.isFile() &&
      entry.name.startsWith("query_engine-") &&
      !entry.name.endsWith(".tmp"),
  );

if (hasGeneratedClient) {
  process.exit(0);
}

const prismaBin =
  process.platform === "win32"
    ? path.join(process.cwd(), "node_modules", ".bin", "prisma.cmd")
    : path.join(process.cwd(), "node_modules", ".bin", "prisma");

const result = spawnSync(prismaBin, ["generate"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: false,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
