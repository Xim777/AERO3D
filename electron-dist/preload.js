import { contextBridge, ipcRenderer } from "electron";
console.log(">>> PRELOAD LOADED <<<");
contextBridge.exposeInMainWorld("api", {
    startTraining: (config) => ipcRenderer.invoke("start-training", config),
    extractMesh: (config) => ipcRenderer.invoke("extract-mesh", config),
    onLog: (callback) => {
        ipcRenderer.on("log", (_, line) => callback(line));
    },
    onTrainingFinished: (callback) => {
        ipcRenderer.on("training-finished", (_, code) => callback(code));
    },
    onExtractionFinished: (callback) => {
        ipcRenderer.on("extraction-finished", (_, code) => callback(code));
    }
});
