import * as fs from "node:fs";
import * as os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const projectRoot = path.resolve(__dirname, "..", "..");

export const resolvePath = (file_path: string): string => {
  if (file_path.startsWith("~")) {
    file_path = path.join(os.homedir(), file_path.substring(1));
  }
  file_path = path.resolve(file_path);
  if (!fs.existsSync(file_path))
    throw new Error(`File doesn't exist: ${file_path}`);

  return file_path;
};

export const basename = (file_path: string) => path.basename(file_path);
