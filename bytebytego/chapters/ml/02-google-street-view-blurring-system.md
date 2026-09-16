# 02: Google Street View Blurring System

## Core Idea
Design an object detection system that blurs faces and license plates in Street View images to protect privacy, framed as regression (bounding box location) + multi-class classification (object class).

## Design Framework / Approach
Use a **two-stage network** (RPN proposes regions → classifier labels them) because the 1M-image dataset isn't huge and accuracy matters more than speed here. Translate the business goal ("protect privacy") into the ML objective ("accurately detect objects"), then blur whatever the model detects.

## Key Concepts & Components
- **Object detection**: two responsibilities — locate (regression on x, y, w, h) and classify each box.
- **Two-stage networks**: R-CNN, Fast R-CNN, Faster R-CNN; slower but more accurate. **One-stage**: YOLO, SSD; faster, combined detection.
- **Data augmentation**: random crop, flips, rotation, color jitter; offline (pre-computed, needs storage) vs online (slower training, no extra storage). Augment bounding boxes alongside images.
- **Loss function**: combined `L = L_cls + λ·L_reg` — cross-entropy for classification, MSE for bounding-box regression.
- **Intersection Over Union (IOU)**: overlap measure deciding whether a detection is correct at a given threshold.
- **Offline metrics**: Precision → **AP** (averages precision over IOU thresholds) → **mAP** (averages AP over classes).
- **Non-maximum suppression (NMS)**: post-processing that keeps confident boxes and removes overlapping duplicates.
- **Online metric**: user reports/complaints; spot-check by human annotators.

## Trade-offs & Anti-patterns
- **Two-stage vs one-stage**: two-stage more accurate but slower; switch to one-stage when data grows or latency matters.
- **Precision depends on the IOU threshold** — always report AP/mAP, not a single-threshold precision.
- **Overlapping bounding boxes**: RPN produces many overlapping proposals; NMS collapses them to one per object.
- **Separate preprocessing (CPU) from blurring (GPU)** so each can scale independently.

## Key Takeaways
1. Split detection into location (regression) and class (classification) and combine losses with a balancing λ.
2. Use mAP as the headline offline metric; rely on user reports as the privacy-safety signal online.
3. Feed user-reported failures back as **hard negatives** to retrain and improve.

## Connects To
- **00-introduction-and-overview**: batch prediction is fine here since latency isn't critical.
- **04-harmful-content-detection**: both are safety systems that demote/remove violating content.
