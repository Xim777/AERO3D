import { ipcMain, BrowserWindow } from "electron";
import { spawn } from "child_process";
import { GSSR_ROOT, CONDA_PYTHON, condaRunArgs } from "./gssr.config.js";
let mainWindow: BrowserWindow | null = null;

export function registerIPC(win: BrowserWindow) {
  mainWindow = win;

// ---- REAL TRAINING ----
  ipcMain.handle("start-training", async (_, config) => {
    const { method, sourcePath, outputPath, split } = config;

    const script = split ? "train_split.py" : "train.py";

    const args = condaRunArgs([
      script,
      method,
      "--source-path",
      sourcePath,
      "--output-path",
      outputPath,
    ]);

    mainWindow?.webContents.send(
      "log",
      `[GS-SR] Starting training: ${script} ${method}`
    );

    const proc = spawn(CONDA_PYTHON, args, {
      cwd: GSSR_ROOT,
      shell: process.platform === "win32", // REQUIRED for Windows
    });

    proc.stdout.on("data", (data) => {
      mainWindow?.webContents.send("log", data.toString());
    });

    proc.stderr.on("data", (data) => {
      mainWindow?.webContents.send("log", data.toString());
    });

    proc.on("close", (code) => {
      mainWindow?.webContents.send(
        "log",
        `[GS-SR] Training finished with code ${code}`
      );
      mainWindow?.webContents.send("training-finished", code);
    });
  });

  // ---- MESH EXTRACTION (mock) ----
  ipcMain.handle("extract-mesh", async (_, config) => {
    mainWindow?.webContents.send(
      "log",
      `[MOCK] Mesh extraction started`
    );

    setTimeout(() => {
      mainWindow?.webContents.send("log", "[MOCK] Mesh extraction finished");
      mainWindow?.webContents.send("extraction-finished", 0);
    }, 1500);
  });
}
