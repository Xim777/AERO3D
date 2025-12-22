
```md
# AERO3D – GS-SR Desktop GUI

AERO3D is a **desktop graphical user interface (GUI)** for **GS-SR (Gaussian-based Surface Reconstruction)** that allows users to perform **surface reconstruction and mesh extraction without using terminal commands**, while keeping the **GS-SR Python backend completely untouched**.

The application bundles GS-SR as a black-box backend and executes it through existing CLI scripts using Electron process orchestration.

---

## 🔹 Key Goals (Non-Negotiable)

- Provide a **CLI-free desktop interface** for GS-SR
- Keep the **GS-SR repository completely unmodified**
- Execute GS-SR using its **existing Python CLI scripts**
- Support:
  - Dataset selection
  - Reconstruction method selection
  - Training start/stop
  - Log monitoring
  - Mesh extraction
  - Output access
- Work as a **self-contained desktop application**

---

## 🔹 High-Level Architecture (Fixed)

```

React UI (Vite + React)
↓ IPC
Electron Main Process
↓ spawn()
GS-SR CLI Scripts (Python)

```

- **React** → UI only
- **Electron** → process orchestration + IPC
- **GS-SR** → black-box computation

❌ No Python code modification  
❌ No CLI exposure to users  
❌ No GPU calls from Electron  

---

## 🔹 Directory Structure (DO NOT BREAK)

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

````

**Rules**
- ❌ Never modify files inside `GS-SR/`
- ✅ Frontend code lives in `src/`
- ✅ Electron orchestration lives in `electron/`

---

## 🔹 Platform & Hardware Requirements

| Component | Requirement |
|--------|------------|
| OS | Linux / WSL2 (Recommended) |
| GPU | NVIDIA GPU with CUDA support |
| CUDA | **11.8 ONLY (Mandatory)** |
| Python | 3.10 |
| Compiler | **GCC 11 (Mandatory)** |
| Node.js | 20.x (Linux / WSL only) |

⚠ CUDA 12.x is **NOT supported** and will break GS-SR CUDA extensions.

---

## 🔹 CUDA 11.8 Installation (MANDATORY)

> **APT-based CUDA installs are NOT supported.**  
> Use the NVIDIA **runfile installer only**.

### 1️⃣ Download CUDA 11.8 Runfile
```bash
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run
````

### 2️⃣ Install Toolkit Only (No Driver, No Nsight)

```bash
sudo sh cuda_11.8.0_520.61.05_linux.run \
  --toolkit \
  --silent \
  --override \
  --no-opengl-libs
```

### 3️⃣ Environment Variables

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

## 🔹 GCC 11 Installation (MANDATORY)

GS-SR CUDA extensions **will fail** without GCC 11.

```bash
sudo apt install gcc-11 g++-11
sudo update-alternatives --set gcc /usr/bin/gcc-11
sudo update-alternatives --set g++ /usr/bin/g++-11
```

Verify:

```bash
gcc --version
```

---

## 🔹 Python Environment Setup (GS-SR Compatible)

### 1️⃣ Clone GS-SR

```bash
cd AERO3D
git clone https://github.com/yanxian-ll/GS-SR
cd GS-SR
```

### 2️⃣ Create Conda Environment

```bash
conda env create --file environment.yml
conda activate gssr
```

✔ Python 3.10 is supported
❌ Python 3.8 is EOL and unsupported

---

## 🔹 PyTorch Installation (CUDA 11.8 ONLY)

⚠ **Do NOT install PyTorch with conda CUDA builds**

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

❌ If this fails, do not proceed.

---

## 🔹 GS-SR Dependencies & CUDA Extensions

From the `AERO3D` root:

```bash
pip install -r requirements.txt
```

If required:

```bash
pip install -e GS-SR/submodules/simple-knn
pip install -e GS-SR/submodules/diff-gaussian-rasterization
pip install -e GS-SR/submodules/diff-plane-rasterization
pip install -e GS-SR/submodules/diff-surfel-rasterization
pip install -e GS-SR/submodules/scaffold-filter
```

---

## 🔹 COLMAP Installation (MANDATORY)

GS-SR uses **Structure-from-Motion (SfM)** via COLMAP.

```bash
sudo apt install colmap
```

Verify:

```bash
colmap --version
```

**Reference**
Schönberger, J. L., & Frahm, J. M. (2016). *Structure-from-Motion Revisited*. CVPR.

---

## 🔹 Node.js & Frontend Setup (Linux / WSL ONLY)

⚠ Do **NOT** use Windows Node.js with WSL files.

Install Node via `nvm`:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

Install dependencies:

```bash
npm install
```

Run development mode:

```bash
npm run dev
```

---

## 🔹 Execution Model

* Electron spawns GS-SR CLI scripts via `spawn()`
* Logs are streamed to the UI via IPC
* Outputs are read from GS-SR result directories
* No shell commands are exposed to users

---

## 🔹 Explicit Non-Goals

* ❌ Python refactoring
* ❌ CUDA 12.x support
* ❌ Conda CUDA PyTorch
* ❌ Direct GPU access from Electron
* ❌ CLI exposure to users

---

## 🔹 One-Line Summary 

> **AERO3D is a desktop GUI that orchestrates GS-SR surface reconstruction through Electron IPC, executing existing GS-SR CLI scripts under a strictly CUDA-11.8-compatible environment without modifying the GS-SR backend.**

---

## 📚 References

1. Kerbl et al., *3D Gaussian Splatting for Real-Time Radiance Field Rendering*, ACM TOG, 2023
2. Yan et al., *GS-SR: Gaussian-based Surface Reconstruction*, GitHub Repository
3. Schönberger & Frahm, *Structure-from-Motion Revisited*, CVPR 2016
4. NVIDIA CUDA Toolkit 11.8 Documentation
5. PyTorch CUDA 11.8 Official Wheels

---

```

---


Just tell me what you want next.
```
