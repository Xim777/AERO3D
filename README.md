


# TRINETRA – GS-SR Desktop GUI

TRINETRA is a self-contained desktop application that provides a graphical user interface (GUI) for **GS-SR (Gaussian-based Surface Reconstruction)**.  
It allows users to run surface reconstruction workflows **without typing any terminal commands**, while keeping the **GS-SR Python backend completely untouched**.

The system uses **Electron + Vite + React** for the frontend and orchestration and executes GS-SR strictly through its **existing CLI scripts**.

---


## 1. Project Goal (Non-Negotiable)

The primary goal of AERO3D is to:

- Provide a desktop GUI for GS-SR
- Eliminate terminal usage for end users
- Execute GS-SR via existing CLI scripts only
- Keep the GS-SR repository completely unmodified
- Work as a self-contained desktop application

The application enables users to:
- Select datasets
- Select reconstruction modes
- Start and stop training
- Monitor logs in real time
- Extract meshes
- Access reconstruction outputs

---

## 2. High-Level Architecture

```text
React UI (Vite + React)
        ↓ IPC
Electron Main Process
        ↓ spawn()
GS-SR CLI Scripts (Python)
````


### Component Responsibilities

* **React**: UI only
* **Electron**: process orchestration and IPC
* **GS-SR**: black-box computation

### Strict Constraints

* No Python code modification
* No CLI exposure to users
* No GPU calls from Electron

---

## 3. Directory Structure 

```bash
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

### Rules

* `GS-SR/` must never be modified
* Frontend code lives in `src/`
* Electron orchestration lives in `electron/`

---

## 4. Supported Platform and Hardware

| Component | Requirement                |
| --------- | -------------------------- |
| OS        | Linux / WSL2 (Recommended) |
| GPU       | NVIDIA CUDA-capable GPU    |
| CUDA      | 11.8 ONLY (Mandatory)      |
| Python    | 3.10                       |
| Compiler  | GCC 11                     |

CUDA 12.x is not supported and will break GS-SR CUDA extensions.

---

## 5. CUDA 11.8 Installation (Mandatory)

APT-based CUDA installations are not reliable on modern Ubuntu / WSL.
The NVIDIA **runfile installer must be used**.

### 5.1 Download CUDA 11.8 Runfile

```bash
wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda_11.8.0_520.61.05_linux.run
```

### 5.2 Install Toolkit Only (No Driver, No Nsight)

```bash
sudo sh cuda_11.8.0_520.61.05_linux.run \
  --toolkit \
  --silent \
  --override \
  --no-opengl-libs
```

### 5.3 Environment Variables

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

## 6. GCC 11 Installation (Mandatory)

GS-SR CUDA extensions require GCC 11.

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

## 7. GS-SR Backend Setup

### 7.1 Clone GS-SR

```bash
cd AERO3D
git clone https://github.com/yanxian-ll/GS-SR
cd GS-SR
```

### 7.2 Create Conda Environment

```bash
conda env create --file environment.yml
conda activate gssr
```

Python 3.10 is required.
Python 3.8 is not supported.

---

## 8. PyTorch Installation (CUDA 11.8 Only)

PyTorch must be installed via pip using official CUDA wheels.
Conda CUDA PyTorch builds are not supported.

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

Expected output:

```
True
11.8
```

If this check fails, do not proceed.

---

## 9. GS-SR CUDA Extensions

From the AERO3D root:

```bash
pip install -r requirements.txt
```

If required, install submodules individually:

```bash
pip install -e GS-SR/submodules/simple-knn
pip install -e GS-SR/submodules/diff-gaussian-rasterization
pip install -e GS-SR/submodules/diff-plane-rasterization
pip install -e GS-SR/submodules/diff-surfel-rasterization
pip install -e GS-SR/submodules/scaffold-filter
```

---

## 10. COLMAP Installation (Mandatory)

GS-SR relies on Structure-from-Motion using COLMAP.

```bash
sudo apt install colmap
```

Verify:

```bash
colmap --version
```

Reference:
Schönberger, J. L., and Frahm, J. M.,
"Structure-from-Motion Revisited", CVPR 2016.

---

## 11. Node.js and Frontend Setup

Node.js must be installed inside Linux / WSL.
Do not use Windows Node.js with WSL filesystems.

Install Node via nvm:

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

## 12. Execution Model

* Electron spawns GS-SR CLI scripts using `spawn()`
* Logs are streamed to the UI via IPC
* Outputs are read from GS-SR result directories
* No terminal access is exposed to users

---

## 13. Explicit Non-Goals

* No Python refactoring
* No CUDA 12.x support
* No conda-based CUDA PyTorch
* No direct GPU calls from Electron
* No CLI exposure to users

---

## 14. References

1. Kerbl et al., "3D Gaussian Splatting for Real-Time Radiance Field Rendering", ACM TOG, 2023
2. Yan et al., GS-SR: Gaussian-based Surface Reconstruction, GitHub Repository
3. Schönberger and Frahm, "Structure-from-Motion Revisited", CVPR 2016
4. NVIDIA CUDA Toolkit 11.8 Documentation
5. PyTorch CUDA 11.8 Wheels Documentation

---

## 15. Summary

AERO3D provides a desktop GUI for GS-SR by orchestrating existing GS-SR CLI scripts through Electron IPC, enabling CUDA-11.8-compatible surface reconstruction without modifying the GS-SR backend.

```
---

