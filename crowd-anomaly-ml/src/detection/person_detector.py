import cv2
from ultralytics import YOLO
import numpy as np

class PersonDetector:
    def __init__(self, model_path='yolov8m.pt'): # Switched from yolov8n to yolov8m
        self.model_path = model_path
        self.model = None
        self.conf_threshold = 0.25 # Lower threshold to catch more people
        self.load_model()

    def load_model(self):
        """Loads the YOLOv8 model."""
        try:
            self.model = YOLO(self.model_path)
        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def detect_people(self, frame, track=False):
        """
        Detects humans in the given frame.
        Returns a list of detections: [x1, y1, x2, y2, confidence, (optional) track_id]
        """
        if self.model is None:
            self.load_model()

        # Class 0 is 'person' in COCO dataset
        if track:
            results = self.model.track(frame, classes=[0], conf=self.conf_threshold, verbose=False, persist=True)[0]
        else:
            results = self.model(frame, classes=[0], conf=self.conf_threshold, verbose=False)[0]
        
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            
            if track and box.id is not None:
                track_id = int(box.id[0].item())
                detections.append([x1, y1, x2, y2, conf, track_id])
            else:
                detections.append([x1, y1, x2, y2, conf])
            
        return detections

    def count_people(self, frame):
        """
        Counts the number of people in the frame.
        Returns JSON-like dictionary.
        """
        detections = self.detect_people(frame)
        
        boxes = [d[:4] for d in detections]
        confidences = [d[4] for d in detections]
        
        return {
            "people_count": len(detections),
            "boxes": boxes,
            "confidence": confidences
        }

    def draw_boxes(self, frame, detections):
        """
        Draws bounding boxes and track IDs on the frame.
        """
        for det in detections:
            if len(det) == 6:
                x1, y1, x2, y2, conf, track_id = det
                label = f"ID:{track_id} {conf:.2f}"
            else:
                x1, y1, x2, y2, conf = det
                label = f"Person {conf:.2f}"
                
            cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            cv2.putText(frame, label, (int(x1), int(y1) - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        return frame
