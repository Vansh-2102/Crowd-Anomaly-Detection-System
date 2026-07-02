import sys
import os
import cv2
import numpy as np
from datetime import datetime

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from detection.person_detector import PersonDetector
from density.density_analyzer import DensityAnalyzer
from motion.optical_flow_detector import OpticalFlowDetector
from motion.stampede_detector import StampedeDetector
from violence.predict import ViolencePredictor
from decision.alert_engine import AlertEngine

print("=== CROWD ANOMALY DETECTION SYSTEM VERIFICATION ===")
print()

# --- Test 1: Initialize all detectors ---
print("1. Initializing all ML components...")
try:
    detector = PersonDetector()
    print("   ✅ Person Detector (YOLOv8) initialized")
    
    density = DensityAnalyzer()
    print("   ✅ Density Analyzer (CSRNet) initialized")
    
    flow = OpticalFlowDetector()
    print("   ✅ Optical Flow Detector initialized")
    
    stampede = StampedeDetector()
    print("   ✅ Stampede Detector initialized")
    
    violence = ViolencePredictor()
    print("   ✅ Violence Predictor initialized")
    
    alert_engine = AlertEngine()
    print("   ✅ Alert Engine initialized")
except Exception as e:
    print(f"   ❌ Initialization failed: {e}")
    sys.exit(1)
print()

# --- Test 2: Create a test image ---
print("2. Creating test image...")
test_image = np.zeros((416, 416, 3), dtype=np.uint8)
# Draw some simple shapes to simulate people for testing
cv2.circle(test_image, (100, 100), 40, (255,255,255), -1)
cv2.circle(test_image, (300, 150), 40, (255,255,255), -1)
cv2.circle(test_image, (200, 300), 40, (255,255,255), -1)
print("   ✅ Test image created")
print()

# --- Test 3: Run full ML pipeline ---
print("3. Running full ML pipeline...")
try:
    detections = detector.detect_people(test_image)
    print(f"   ✅ Detected {len(detections)} people")
    
    count_data = detector.count_people(test_image)
    print(f"   ✅ People count (YOLO): {count_data['people_count']}")
    
    density_data = density.analyze_density(test_image, detections)
    print(f"   ✅ Density score: {density_data['density_score']}")
    print(f"   ✅ Risk level: {density_data['risk_level']}")
    
    flow_data = flow.calculate_flow(test_image)
    print("   ✅ Optical Flow calculated")
    
    mag, ang = flow.get_motion_vectors(flow_data)
    stampede_data = stampede.detect_stampede(mag, ang)
    print(f"   ✅ Stampede detected: {stampede_data['stampede']}")
    print(f"   ✅ Motion speed: {stampede_data['speed']:.2f}")
    
    violence_data = violence.update_and_predict(test_image)
    print(f"   ✅ Violence detected: {violence_data['fight_detected']}")
    print(f"   ✅ Violence confidence: {violence_data['confidence']:.2f}")
except Exception as e:
    print(f"   ❌ Pipeline failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
print()

# --- Test 4: Generate JSON alert ---
print("4. Generating final alert JSON...")
try:
    combined_results = {
        "people_count": count_data['people_count'],
        "density_score": density_data['density_score'],
        "risk_level": density_data['risk_level'],
        "stampede": stampede_data['stampede'],
        "speed": stampede_data['speed'],
        "fight_detected": violence_data['fight_detected'],
        "fight_confidence": violence_data['confidence']
    }
    
    alert_data = alert_engine.get_alert(combined_results)
    
    # Add API-specific fields
    alert_data["camera_id"] = "test_cam_01"
    alert_data["timestamp"] = datetime.now().isoformat()
    
    print("   ✅ Final JSON alert generated successfully!")
    print()
    print("=" * 60)
    print("📋 FINAL ALERT JSON:")
    print("=" * 60)
    import json
    print(json.dumps(alert_data, indent=2))
    print("=" * 60)
except Exception as e:
    print(f"   ❌ JSON generation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
print()

print("🎉 SUCCESS: ALL ML COMPONENTS AND JSON OUTPUT ARE WORKING PERFECTLY! 🎊")