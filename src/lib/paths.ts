import os from "os";
import path from "path";
import fs from "fs";

/**
 * Every piece of persistent state for Ledger lives under a single
 * macOS-conventional Application Support directory, resolved from the
 * current user's home directory at runtime — same pattern as Almanac,
 * so nothing is hardcoded to a particular machine or username.
 */
export const APP_DATA_DIR = path.join(os.homedir(), "Library", "Application Support", "Ledger");

export const DB_PATH = path.join(APP_DATA_DIR, "ledger.db");

export function ensureDataDirs() {
  fs.mkdirSync(APP_DATA_DIR, { recursive: true });
}
