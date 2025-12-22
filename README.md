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
├── electron/              # Electron main / preload / IPC
├── dist-react/
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

**Rules**:

* `GS-SR/` → **NEVER modify Python files**
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

---

## 4. System requirements (GPU backend)

### Supported platform

* Linux / WSL2 (recommended)
* NVIDIA GPU with CUDA support
* **CUDA 11.8 only** (mandatory)

> CUDA 12.x is **not supported** for GS-SR and will break CUDA extensions.

---

## 5. CUDA 11.8 installation (runfile – REQUIRED)

APT-based CUDA installs are **not reliable** on modern Ubuntu / WSL due to
Nsight + `libtinfo5` dependency issues.

**You must use the NVIDIA runfile installer.**

### 5.1 Download CUDA 11.8 runfile

```bash
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run
```

### 5.2 Install CUDA toolkit only (NO driver, NO Nsight)

```bash
sudo sh cuda_11.8.0_520.61.05_linux.run \
  --toolkit \
  --silent \
  --override \
  --no-opengl-libs
```

This installs:

* `nvcc`
* CUDA headers
* CUDA libraries

It **does not** install:

* NVIDIA drivers (handled by Windows host in WSL)
* Nsight tools (avoids `libtinfo5` errors)

### 5.3 Environment variables

Add to `~/.bashrc`:

```bash
export CUDA_HOME=/usr/local/cuda-11.8
export PATH=$CUDA_HOME/bin:$PATH
export LD_LIBRARY_PATH=$CUDA_HOME/lib64:$LD_LIBRARY_PATH
```

Reload:

```bash
source ~/.bashrc
```

Verify:

```bash
nvcc --version
```

Expected:

```
Cuda compilation tools, release 11.8
```

---

## 6. Python environment setup (GS-SR compatible)

### 6.1 Clone Repo

```bash
cd AERO3D
git clone https://github.com/yanxian-ll/GS-SR
cd GS-SR
```

### 6.2 Create Conda environment (minimal)

```bash
conda env create --file environment.yml
conda activate gssr
```

> Python 3.8 is EOL and causes CUDA / PyTorch build failures.
> Python 3.10 is the supported baseline.

---

## 7. PyTorch with CUDA 11.8 (MANDATORY)

PyTorch **must** be installed via pip using the official CUDA wheels.
Do **not** rely on conda for CUDA PyTorch.

```bash
pip install torch==2.1.2 torchvision==0.16.2 torchaudio==2.1.2 \
  --index-url https://download.pytorch.org/whl/cu118
```

Verify:

```bash
python - <<EOF
import torch
print(torch.cuda.is_available())
print(torch.version.cuda)
EOF
```

Expected:

```
True
11.8
```

If this check fails, **do not proceed**.

---

## 8. GS-SR Python dependencies

From the **AERO3D root**:

```bash
pip install -r requirements.txt 
```
CUDA extensions are built automatically during install.

If needed, install submodules individually:

```bash
pip install -e GS-SR/submodules/simple-knn
pip install -e GS-SR/submodules/diff-gaussian-rasterization
pip install -e GS-SR/submodules/diff-plane-rasterization
pip install -e GS-SR/submodules/diff-surfel-rasterization
pip install -e GS-SR/submodules/scaffold-filter
```

---

## 9. Electron + Frontend setup (Linux / WSL)

### Important rule

> **Node.js must be installed inside WSL/Linux.
> Do NOT use Windows Node.js with WSL filesystems.**

Install Node via `nvm`:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

Install frontend dependencies:

```bash
npm install
```

Run dev mode:

```bash
npm run dev
```

---

## 10. Execution model (final)

* Electron **spawns GS-SR CLI scripts**
* No Python code is modified
* No shell commands exposed to the user
* Logs are streamed back to the UI via IPC
* Outputs are read from GS-SR result directories

---

## 11. Non-goals (explicit)

* No Python refactors
* No CUDA 12.x support
* No conda-based PyTorch CUDA installs
* No direct GPU calls from Electron
* No CLI exposure to users
