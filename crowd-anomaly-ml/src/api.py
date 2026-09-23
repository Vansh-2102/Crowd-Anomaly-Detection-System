import sys
import os
import base64
import numpy as np
import cv2  # type: ignore
import traceback
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import telegram
from telegram import InputFile

# Load environment variables
load_dotenv()

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import CrowdAnomalySystem

# Global variables
system = None
previous_frame = None
telegram_bot = None
telegram_chat_id = None
telegram_enabled = False
last_telegram_alert_time = 0
last_safe_alert_time = 0

@asynccontextmanager
async def lifespan(app: FastAPI):
    global system, previous_frame, telegram_bot, telegram_chat_id, telegram_enabled, last_telegram_alert_time, last_safe_alert_time
    print("Loading Crowd Anomaly Detection System...")
    system = CrowdAnomalySystem()
    previous_frame = None
    
    # Initialize Telegram
    telegram_enabled = os.getenv("TELEGRAM_ENABLED", "false").lower() == "true"
    if telegram_enabled:
        bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        chat_id = os.getenv("TELEGRAM_CHAT_ID")
        if bot_token and chat_id:
            telegram_bot = telegram.Bot(token=bot_token)
            telegram_chat_id = chat_id
            print(f"Telegram bot initialized (chat ID: {chat_id})")
        else:
            print("Telegram credentials missing, disabling Telegram integration")
            telegram_enabled = False
    else:
        print("Telegram integration disabled")
    
    print("System loaded successfully!")
    yield
    system = None
    previous_frame = None
    telegram_bot = None
    print("System shut down.")

app = FastAPI(title="Crowd Anomaly Detection API", lifespan=lifespan)

# Allow all CORS for Spring Boot
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Crowd Anomaly Detection API is running!",
        "status": "success",
        "endpoints": {
            "/health": "Check server status",
            "/docs": "Interactive API documentation",
            "/demo": "Quick demo endpoint (no input required)",
            "/analyze-frame": "Analyze single frame (POST with JSON containing 'frame' (base64) and 'camera_id')",
            "/stream-camera": "LIVE STREAM: Webcam feed with continuous JSON alerts (Server-Sent Events)"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "models_loaded": system is not None}

async def send_telegram_alert(viz_frame, alert_data):
    """Send an alert to Telegram with the frame and details."""
    global telegram_enabled, telegram_bot, telegram_chat_id
    if not telegram_enabled or not telegram_bot or not telegram_chat_id:
        print(f"Telegram alert skipped: enabled={telegram_enabled}, bot={'present' if telegram_bot else 'None'}, chat_id={telegram_chat_id}")
        return
    
    try:
        import io
        # Encode frame as JPEG for Telegram
        _, buffer = cv2.imencode('.jpg', viz_frame)
        image_bytes = buffer.tobytes()
        
        # Create caption
        caption = f"""
⚠️ CROWD ANOMALY ALERT ⚠️
Camera: {alert_data.get('camera_id', 'unknown')}
Timestamp: {alert_data.get('timestamp', datetime.now().isoformat())}
Alert Level: {alert_data.get('alert_level', 'UNKNOWN')}
People Count: {alert_data.get('people_count', 0)}
Density Score: {alert_data.get('density_score', 0)}
Fight Detected: {'Yes' if alert_data.get('fight_detected') else 'No'}
Stampede Detected: {'Yes' if alert_data.get('stampede') else 'No'}
        """.strip()
        
        photo_stream = io.BytesIO(image_bytes)
        photo_stream.name = f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        
        # Send photo to Telegram
        await telegram_bot.send_photo(
            chat_id=telegram_chat_id,
            photo=photo_stream,
            caption=caption
        )
        print("Telegram alert photo sent successfully!")
    except Exception as e:
        print(f"Failed to send Telegram alert: {e}")
        traceback.print_exc()

@app.post("/demo")
async def demo_endpoint():
    if system is None:
        raise HTTPException(status_code=500, detail="System not ready")
    
    # Try to capture a frame from webcam
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        ret, frame = cap.read()
        cap.release()
        if ret:
            return await process_single_frame(frame, "demo_cam")
    
    # Fallback to test image if webcam fails
    test_frame = np.zeros((416, 416, 3), dtype=np.uint8)
    cv2.circle(test_frame, (208, 208), 100, (255, 255, 255), -1)
    return await process_single_frame(test_frame, "demo_cam")

async def process_single_frame(frame, camera_id="test_cam"):
    global system, previous_frame, last_telegram_alert_time, last_safe_alert_time

    try:
        if system is None:
            raise HTTPException(status_code=500, detail="System not initialized")
        
        # 1. YOLO Detection
        detections = system.detector.detect_people(frame)
        
        # 2. People Count (FIX: Directly use len(detections))
        count_data = {
            "people_count": len(detections),
            "boxes": [d[:4] for d in detections],
            "confidence": [d[4] for d in detections]
        }
        
        # 3. Density Analysis
        density_data = system.density_analyzer.analyze_density(frame, detections)
        
        # 4. Optical Flow
        if previous_frame is None:
            previous_frame = frame
            flow_data = system.flow_detector.calculate_flow(previous_frame)
        else:
            flow_data = system.flow_detector.calculate_flow(previous_frame, frame)
        
        # 5. Motion Vectors & Stampede Detection
        mag, ang = system.flow_detector.get_motion_vectors(flow_data)
        stampede_data = system.stampede_detector.detect_stampede(mag, ang)
        
        # 6. Violence Detection with fallback
        try:
            violence_data = system.violence_predictor.update_and_predict(frame)
        except Exception as ve:
            print(f"Violence model unavailable: {ve}")
            violence_data = {"fight_detected": False, "confidence": 0.0}
        
        # 7. Alert Engine
        combined_results = {
            "people_count": count_data["people_count"],
            "density_score": density_data["density_score"],
            "risk_level": density_data["risk_level"],
            "stampede": stampede_data["stampede"],
            "speed": stampede_data["speed"],
            "fight_detected": violence_data["fight_detected"],
            "fight_confidence": violence_data["confidence"]
        }
        
        alert_data = system.alert_engine.get_alert(combined_results)
        alert_data["camera_id"] = camera_id
        alert_data["timestamp"] = datetime.now().isoformat()
        
        # 8. Encode frame as base64 for frontend
        viz_frame = system.detector.draw_boxes(frame.copy(), detections)
        _, buffer = cv2.imencode('.jpg', viz_frame)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        alert_data["frame"] = f"data:image/jpeg;base64,{frame_base64}"
        
        # 9. Send Telegram alert
        current_time = time.time()
        alert_level = alert_data.get("alert_level", "SAFE")
        
        # For WARNING, DANGER, CRITICAL: send at most once every 3 seconds to avoid rate limiting
        if alert_level in ["WARNING", "DANGER", "CRITICAL"]:
            if current_time - last_telegram_alert_time >= 3:
                await send_telegram_alert(viz_frame, alert_data)
                last_telegram_alert_time = current_time
        # For SAFE: send only every 15 seconds
        elif alert_level == "SAFE":
            if current_time - last_safe_alert_time >= 15:
                await send_telegram_alert(viz_frame, alert_data)
                last_safe_alert_time = current_time
        
        # Save current frame as previous
        previous_frame = frame.copy()
        
        return alert_data
        
    except HTTPException:
        raise
    except Exception as e:
        print("=== SERVER ERROR ===")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-frame")
async def analyze_frame(request: Request):
    if system is None:
        raise HTTPException(status_code=500, detail="System not ready")
    
    try:
        # Safely get JSON body
        try:
            body = await request.body()
            if not body:
                raise HTTPException(status_code=400, detail="Empty request body. Please send valid JSON.")
            data = await request.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON body: {str(e)}. Please send valid JSON containing 'frame' and 'camera_id' fields.")
        
        base64_frame = data.get("frame", "")
        camera_id = data.get("camera_id", "unknown")
        
        if not base64_frame:
            raise HTTPException(status_code=400, detail="Missing 'frame' field. Please include a base64-encoded image.")
        
        # Decode base64 safely
        try:
            if "," in base64_frame:
                base64_frame = base64_frame.split(",")[1]
            img_bytes = base64.b64decode(base64_frame, validate=True)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image: {str(e)}. Please encode your image properly as base64.")
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Cannot decode image. Please send a valid JPG or PNG image encoded as base64.")
        
        return await process_single_frame(frame, camera_id)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print("=== SERVER ERROR ===")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stream-camera")
async def stream_camera():
    """
    LIVE STREAM endpoint using Server-Sent Events (SSE)
    """
    if system is None:
        raise HTTPException(status_code=500, detail="System not ready")
    
    async def event_generator():
        global previous_frame
        cap = None
        has_hardware_cam = False
        try:
            cap = cv2.VideoCapture(0)
            has_hardware_cam = cap.isOpened()
        except Exception:
            has_hardware_cam = False

        sim_step = 0
        try:
            while True:
                frame = None
                if has_hardware_cam and cap is not None:
                    ret, f = cap.read()
                    if ret and f is not None:
                        frame = f
                    else:
                        has_hardware_cam = False

                if frame is None:
                    # Simulated crowd frame for Docker environments where host webcam is not mapped
                    import math
                    frame = np.zeros((480, 640, 3), dtype=np.uint8)
                    frame[:] = (20, 24, 35)

                    sim_step = (sim_step + 1) % 360
                    cx1 = int(320 + 120 * math.sin(math.radians(sim_step * 2)))
                    cy1 = int(240 + 50 * math.cos(math.radians(sim_step * 2)))
                    cx2 = int(240 + 80 * math.cos(math.radians(sim_step * 3)))
                    cy2 = int(270 + 40 * math.sin(math.radians(sim_step * 3)))
                    cx3 = int(420 + 90 * math.sin(math.radians(sim_step)))
                    cy3 = int(220 + 60 * math.cos(math.radians(sim_step)))

                    for (cx, cy) in [(cx1, cy1), (cx2, cy2), (cx3, cy3)]:
                        cv2.circle(frame, (cx, cy - 30), 16, (210, 210, 210), -1)
                        cv2.rectangle(frame, (cx - 14, cy - 14), (cx + 14, cy + 35), (170, 150, 110), -1)
                        cv2.line(frame, (cx - 10, cy + 35), (cx - 12, cy + 65), (130, 130, 130), 3)
                        cv2.line(frame, (cx + 10, cy + 35), (cx + 12, cy + 65), (130, 130, 130), 3)

                    cv2.putText(frame, "LIVE SIMULATION FEED", (20, 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 212, 255), 2)
                    cv2.putText(frame, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), (20, 70),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (160, 160, 160), 1)

                alert = await process_single_frame(frame, "live_cam_01")
                import json
                yield f"data: {json.dumps(alert)}\n\n"

                import asyncio
                await asyncio.sleep(0.15)

        except Exception as e:
            import json
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            if cap is not None:
                cap.release()
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
