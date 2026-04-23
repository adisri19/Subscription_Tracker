import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const repoRoot = process.cwd();
const ignoredPrefixes = [
  ".git",
  "node_modules",
  ".vscode",
];

const ignoredSuffixes = [
  ".DS_Store",
  ".log",
];

const debounceMs = 1200;
let timer = null;
let commitInProgress = false;

const shouldIgnore = (targetPath) => {
  const relativePath = path.relative(repoRoot, targetPath);

  if (!relativePath || relativePath.startsWith("..")) {
    return true;
  }

  if (ignoredPrefixes.some((prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}${path.sep}`))) {
    return true;
  }

  if (relativePath.startsWith(".env.") && relativePath.endsWith(".local")) {
    return true;
  }

  return ignoredSuffixes.some((suffix) => relativePath.endsWith(suffix));
};

const runGit = (args) =>
  execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

const commitChanges = () => {
  if (commitInProgress) {
    return;
  }

  commitInProgress = true;

  try {
    runGit(["add", "-A"]);

    const stagedDiff = runGit(["diff", "--cached", "--name-only"]);
    if (!stagedDiff) {
      return;
    }

    const timestamp = new Date().toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
    const message = `auto-commit: ${timestamp}`;

    execFileSync("git", ["commit", "-m", message], {
      cwd: repoRoot,
      stdio: "inherit",
    });

    if (process.env.AUTO_PUSH === "1") {
      execFileSync("git", ["push"], {
        cwd: repoRoot,
        stdio: "inherit",
      });
    }
  } catch (error) {
    console.error("Auto-commit failed:", error.message);
  } finally {
    commitInProgress = false;
  }
};

const scheduleCommit = (targetPath) => {
  if (targetPath && shouldIgnore(targetPath)) {
    return;
  }

  clearTimeout(timer);
  timer = setTimeout(commitChanges, debounceMs);
};

const watchDirectory = (directoryPath) => {
  if (shouldIgnore(directoryPath)) {
    return;
  }

  fs.watch(directoryPath, { persistent: true }, (_, filename) => {
    const resolvedPath = filename ? path.join(directoryPath, filename.toString()) : directoryPath;
    scheduleCommit(resolvedPath);

    try {
      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
        watchDirectory(resolvedPath);
      }
    } catch {
      // Ignore transient filesystem races from save/delete events.
    }
  });

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      watchDirectory(path.join(directoryPath, entry.name));
    }
  }
};

console.log("Auto-commit watcher started.");
console.log("Every saved change will be staged and committed.");
if (process.env.AUTO_PUSH === "1") {
  console.log("Auto-push is enabled.");
}

watchDirectory(repoRoot);
scheduleCommit(repoRoot);
