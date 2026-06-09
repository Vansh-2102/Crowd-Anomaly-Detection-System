import cv2
import json
import time
import argparse
import sys
import os

# Add src to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from detection.person_detector import PersonDetector
from density.density_analyzer import DensityAnalyzer
from density.heatmap_generator import HeatmapGenerator
from motion.optical_flow_detector import OpticalFlowDetector
from motion.stampede_detector import StampedeDetector
from violence.predict import ViolencePredictor
from decision.alert_engine import AlertEngine

class CrowdAnomalySystem:
    def __init__(self, model_yolo='yolov8m.pt', 
                 model_violence=None, 
                 model_density=None):
        
        # Determine base paths
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Default model paths if not provided
        if model_violence is None:
            # Check multiple possible locations for the violence model
            model_violence = os.path.join(base_dir, 'models', 'trained_models', 'fight_detection_model.h5')
            if not os.path.exists(model_violence):
                # Fallback for different project structures
                model_violence = os.path.join(os.path.dirname(base_dir), 'models', 'trained_models', 'fight_detection_model.h5')
        
        if model_density is None:
            model_density = os.path.join(base_dir, 'models', 'trained_models', 'density_model.pth')

        print(f"Initializing System...")
        print(f"YOLO Model: {model_yolo}")
        print(f"Violence Model: {model_violence}")
        print(f"Density Model: {model_density}")

        self.detector = PersonDetector(model_yolo)
        self.density_analyzer = DensityAnalyzer(model_path=model_density)
        self.heatmap_gen = HeatmapGenerator()
        self.flow_detector = OpticalFlowDetector()
        self.stampede_detector = StampedeDetector()
        self.violence_predictor = ViolencePredictor(model_violence)
        self.alert_engine = AlertEngine()

    def process_video(self, source=0, show_preview=True):
        """
        Main processing loop.
        source: 0 for webcam, or path to video file/RTSP stream.
        """
        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            print(f"Error: Could not open video source {source}")
            return

        display_heatmap = True # Toggle with 'h' key

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # 1. YOLO Detection
            detections = self.detector.detect_people(frame)
            
            # 2. Crowd Counting
            count_data = self.detector.count_people(frame)
            
            # 3. Density Analysis (using both YOLO and CSRNet AI)
            density_data = self.density_analyzer.analyze_density(frame, detections)
            
            # 4. Heatmap Generation
            heatmap_frame = self.heatmap_gen.generate_heatmap(frame.copy(), detections)
            
            # 5. Optical Flow Analysis
            flow = self.flow_detector.calculate_flow(frame)
            mag, ang = self.flow_detector.get_motion_vectors(flow)
            
            # 6. Stampede Detection
            stampede_data = self.stampede_detector.detect_stampede(mag, ang)
            
            # 7. Violence Detection
            violence_data = self.violence_predictor.update_and_predict(frame)
            
            # 8. Alert Engine
            combined_results = {
                "people_count": count_data["people_count"],
                "density_score": density_data["density_score"],
                "risk_level": density_data["risk_level"],
                "stampede": stampede_data["stampede"],
                "speed": stampede_data["speed"],
                "fight_detected": violence_data["fight_detected"],
                "fight_confidence": violence_data["confidence"]
            }
            
            alert_data = self.alert_engine.get_alert(combined_results)
            
            # JSON Output
            print(json.dumps(alert_data))
            
            if show_preview:
                # Visualization
                base_frame = heatmap_frame if display_heatmap else frame.copy()
                viz_frame = self.detector.draw_boxes(base_frame, detections)
                
                # Add UI Overlay
                cv2.putText(viz_frame, f"Alert: {alert_data['alert_level']}", (20, 40), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255) if alert_data['alert_level'] != "SAFE" else (0, 255, 0), 2)
                cv2.putText(viz_frame, f"People (YOLO): {alert_data['people_count']}", (20, 80), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(viz_frame, f"People (AI): {density_data['ai_count']}", (20, 110), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(viz_frame, "Press 'h' to toggle Heatmap, 'q' to quit", (20, viz_frame.shape[0] - 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                
                cv2.imshow('Crowd Anomaly Detection System', viz_frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('h'):
                    display_heatmap = not display_heatmap

        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crowd Anomaly Detection System")
    parser.add_argument("--source", type=str, default="0", help="Video source (0 for webcam, file path, or RTSP)")
    parser.add_argument("--no-preview", action="store_true", help="Disable preview window")
    
    args = parser.parse_args()
    
    # Handle webcam index vs file path
    source = int(args.source) if args.source.isdigit() else args.source
    
    system = CrowdAnomalySystem()
    system.process_video(source=source, show_preview=not args.no_preview)
