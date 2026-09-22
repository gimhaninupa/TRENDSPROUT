---
title: TRENDSPROUT AI Computer Vision Microservice
emoji: 🌿
colorFrom: purple
colorTo: indigo
sdk: gradio
sdk_version: 4.44.1
app_file: app.py
pinned: false
---

# TRENDSPROUT Computer Vision Microservice

FastAPI computer vision backend powering the TRENDSPROUT fashion platform.

## Endpoints
- `POST /api/cv/remove-bg`: Deep learning background removal for fashion garments (rembg / U²-Net).
- `POST /api/cv/generate-mockup`: 2D to 3D photorealistic apparel mockup mapping (OpenCV displacement + lighting blending).
- `POST /api/cv/visual-search`: Deep feature extraction and visual similarity matching with "Drop & Crop" functionality.

## Local Execution
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
