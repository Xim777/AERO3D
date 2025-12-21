import path from "path";
import { fileURLToPath } from "url";
// ESM-safe dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root of the whole project
export const PROJECT_ROOT = path.resolve(__dirname, "..");
// Path to bundled GS-SR repo
export const GSSR_ROOT = path.join(PROJECT_ROOT, "GS-SR");
// Conda environment name
export const CONDA_ENV_NAME = "gssr";
// Python command via conda
export const CONDA_PYTHON = "conda";
// Helper to build conda-run command
export function condaRunArgs(args) {
    return ["run", "-n", CONDA_ENV_NAME, "python", ...args];
}
