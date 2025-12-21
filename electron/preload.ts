import { contextBridge, ipcRenderer } from "electron";

console.log(">>> PRELOAD LOADED <<<");

contextBridge.exposeInMainWorld("api", {
  startTraining: (config: {
    method: string;
    sourcePath: string;
    outputPath: string;
    split: boolean;
  }) => ipcRenderer.invoke("start-training", config),

  extractMesh: (config: {
    configPath: string;
    useCPU: boolean;
  }) => ipcRenderer.invoke("extract-mesh", config),

  onLog: (callback: (line: string) => void) => {
    ipcRenderer.on("log", (_, line) => callback(line));
  },

  onTrainingFinished: (callback: (code: number) => void) => {
    ipcRenderer.on("training-finished", (_, code) => callback(code));
  },

  onExtractionFinished: (callback: (code: number) => void) => {
    ipcRenderer.on("extraction-finished", (_, code) => callback(code));
  }
});
