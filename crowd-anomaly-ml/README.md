# Crowd Anomaly Detection System (ML Module)

This project is a standalone Machine Learning and Computer Vision module for detecting crowd anomalies. It processes video streams (files, webcams, or RTSP) and outputs real-time JSON data regarding crowd density, counting, stampede/panic movements, and violence detection.

## Project Structure

```
crowd-anomaly-ml/
├── datasets/             # Place datasets here
├── models/
│   ├── yolo/             # YOLOv8 models
│   ├── violence/         # Violence detection model architecture
│   └── trained_models/   # Saved .h5 or .pt models
├── src/
│   ├── detection/        # Person detection and counting
│   ├── density/          # Density analysis and heatmap generation
│   ├── motion/           # Optical flow and stampede detection
│   ├── violence/         # Violence detection (CNN-LSTM)
│   ├── decision/         # Alert decision engine
│   ├── main.py           # Main pipeline
│   └── api.py            # FastAPI server
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Features

1. **Person Detection & Counting**: Uses YOLOv8n to identify and count people.
2. **Crowd Density Analysis**: Divides the frame into a grid and calculates occupancy levels.
3. **Heatmap Generation**: Real-time Gaussian-smoothed crowd heatmaps.
4. **Stampede Detection**: Uses Farneback Optical Flow to detect sudden mass directional movement.
5. **Violence Detection**: A CNN-LSTM model trained on the RWF-2000 dataset.
6. **Alert Engine**: A rule-based system to classify risk levels (SAFE, WARNING, DANGER, CRITICAL).
7. **Telegram Alerts**: Sends real-time alerts with photos to a Telegram chat (configurable).

## Installation

1. Install Python 3.11.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

### 1. Telegram Setup (Optional but Recommended)
1. Create a Telegram bot using [@BotFather](https://t.me/BotFather) and get your bot token.
2. Get your chat ID by sending a message to [@userinfobot](https://t.me/userinfobot).
3. Copy `.env.example` to `.env` in the `crowd-anomaly-ml` directory:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your credentials:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   TELEGRAM_ENABLED=true
   ```

## Dataset Instructions

### 1. RWF-2000 (Violence Detection)
- Download from [Github/RWF-2000](https://github.com/m-pavia/RWF-2000).
- Structure:
  ```
  datasets/RWF-2000/
  ├── Fight/
  └── NonFight/
  ```

### 2. ShanghaiTech (Crowd Counting)
- Download from [ShanghaiTech Dataset](https://github.com/svip-lab/ShanghaiTech).
- Used for validating density and counting models.

## Training the Violence Model

To train the violence detection model:
1. Ensure the RWF-2000 dataset is in `datasets/RWF-2000`.
2. Run the training script:
   ```bash
   python src/violence/train.py
   ```
3. The model will be saved to `models/trained_models/fight_detection_model.h5`.

## Usage

### Run the FastAPI Server
```bash
python src/api.py
```

The server will start at `http://localhost:8000` and includes:
- `/docs`: Swagger UI for API documentation
- `/health`: Health check endpoint
- `/stream-camera`: Live video stream (SSE)
- `/analyze-frame`: Analyze a single frame

### Run the Main Pipeline (Legacy)
```bash
# Using webcam
python src/main.py --source 0

# Using a video file
python src/main.py --source path/to/video.mp4

# Without preview (for backend integration)
python src/main.py --source path/to/video.mp4 --no-preview
```

## JSON Output Example

The system prints JSON to stdout for every frame (or sequence):

```json
{
    "alert_level": "CRITICAL",
    "reason": "Violence/Fight Detected",
    "people_count": 102,
    "density_score": 89,
    "stampede": false,
    "fight_detected": true
}
```

## Integration with Spring Boot

This module is designed to be called as a subprocess by a Spring Boot application or to send data via a Message Queue (like RabbitMQ/Kafka) or a simple REST POST request to the Spring Boot backend.
