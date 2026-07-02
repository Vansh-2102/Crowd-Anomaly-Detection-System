import sys
import os
import cv2
from datetime import datetime

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import CrowdAnomalySystem

print("=== Testing Real People Detection on Live Camera ===")
print()
print("Loading system...")
system = CrowdAnomalySystem()
print("✅ System loaded!")
print()

# Open webcam and capture one real frame
print("Opening webcam...")
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Cannot open webcam!")
    sys.exit(1)

print("✅ Webcam opened! Please look at the camera for 2 seconds...")
cv2.waitKey(2000)

# Read a few frames to let the camera adjust exposure
for i in range(10):
    ret, frame = cap.read()
    if ret:
        real_frame = frame.copy()
        print("✅ Real frame captured!")
        break

cap.release()

# Run real detection
print("Running detection on real frame...")
detections = system.detector.detect_people(real_frame)
print(f"✅ YOLOv8 detected {len(detections)} people!")

count_data = {
    "people_count": len(detections),
    "boxes": [d[:4] for d in detections],
    "confidence": [d[4] for d in detections]
}

density_data = system.density_analyzer.analyze_density(real_frame, detections)

# Optical flow needs two frames (we'll use the same frame twice for quick test)
flow_data = system.flow_detector.calculate_flow(real_frame, real_frame)
mag, ang = system.flow_detector.get_motion_vectors(flow_data)
stampede_data = system.stampede_detector.detect_stampede(mag, ang)

try:
    violence_data = system.violence_predictor.update_and_predict(real_frame)
except Exception as e:
    violence_data = {"fight_detected": False, "confidence": 0.0}

combined = {
    "people_count": count_data["people_count"],
    "density_score": density_data["density_score"],
    "risk_level": density_data["risk_level"],
    "stampede": stampede_data["stampede"],
    "speed": stampede_data["speed"],
    "fight_detected": violence_data["fight_detected"],
    "fight_confidence": violence_data["confidence"]
}

alert = system.alert_engine.get_alert(combined)
alert["camera_id"] = "real_cam_test"
alert["timestamp"] = datetime.now().isoformat()

print()
print("=" * 60)
print("📋 FINAL ALERT JSON WITH REAL PEOPLE DETECTION:")
print("=" * 60)
import json
print(json.dumps(alert, indent=2))
print("=" * 60)

# Show the image with detection bounding boxes
print()
print("Showing image with detected bounding boxes (press any key to close)")
frame_with_boxes = system.detector.draw_boxes(real_frame, detections)
cv2.imshow("Real Detection Test", frame_with_boxes)
cv2.waitKey(0)
cv2.destroyAllWindows()

print()
print("🎉 REAL PEOPLE DETECTION TEST COMPLETED!")
print(f"✅ People count from real detection: {count_data['people_count']}")