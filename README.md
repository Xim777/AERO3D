# AERO3D – GS-SR Desktop GUI

**Electron + Vite + React frontend for GS-SR (bundled, CLI-free)**

---

## 1. Goal (non-negotiable)

Build a **desktop GUI application** that allows users to run **GS-SR surface reconstruction** **without typing any terminal commands**, while keeping the **GS-SR Python backend completely untouched**.

The application will:

* Bundle the GS-SR repository
* Provide a UI to:

  * select datasets
  * select reconstruction methods
  * start / stop training
  * monitor logs
  * extract meshes
  * access outputs
* Execute GS-SR via its **existing CLI scripts**
* Work as a **self-contained desktop app**

---

## 2. Current directory layout (baseline – do not break)

```
AERO3D/
├── GS-SR/                 # Python backend (UNTOUCHED)
│   ├── train.py
│   ├── train_split.py
│   ├── extract_mesh.py
│   ├── extract_mesh_split.py
│   ├── environment.yml
│   └── ...
│
├── src/                   # React frontend (Vite)
├── public/
├── electron/              # (currently empty / minimal)
├── dist-react/
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

**Rule**:

* `GS-SR/` → NEVER modify Python files
* Frontend lives in `src/`
* Electron orchestration lives in `electron/`

---

## 3. High-level architecture (fixed)

```
React UI (src/)
        ↓ IPC
Electron Main (electron/)
        ↓ spawn()
GS-SR CLI (GS-SR/)
```

* React → UI only
* Electron → process orchestration
* GS-SR → black-box computation
