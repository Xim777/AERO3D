interface Window {
  api: {
    startTraining: (config: {
      method: string;
      sourcePath: string;
      outputPath: string;
      split: boolean;
    }) => Promise<void>;

    extractMesh: (config: {
      configPath: string;
      useCPU: boolean;
    }) => Promise<void>;

    onLog: (cb: (line: string) => void) => void;
    onTrainingFinished: (cb: (code: number) => void) => void;
    onExtractionFinished: (cb: (code: number) => void) => void;
  };
}
