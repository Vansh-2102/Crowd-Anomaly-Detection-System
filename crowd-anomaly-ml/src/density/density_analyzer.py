import numpy as np
import torch
import os
import cv2
from PIL import Image
from torchvision import transforms
try:
    from density.model import CSRNet
except ImportError:
    from model import CSRNet

class DensityAnalyzer:
    def __init__(self, model_path=None, grid_size=(4, 4), thresholds=None):
        self.grid_size = grid_size
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        
        # Load AI Model if path provided
        if model_path and os.path.exists(model_path):
            print(f"Loading CSRNet model from {model_path}...")
            try:
                self.model = CSRNet().to(self.device)
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model.eval()
                print("CSRNet model loaded successfully.")
            except Exception as e:
                print(f"Error loading CSRNet model: {e}")
                self.model = None
        
        self.transform = transforms.Compose([
            transforms.Resize((512, 640)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
        # Thresholds for density score (0-100)
        self.thresholds = thresholds or {
            "SAFE": 30,
            "WARNING": 50,
            "DANGER": 80,
            "CRITICAL": 100
        }

    def analyze_density(self, frame, detections):
        """
        Analyzes crowd density using both YOLO grid and CSRNet AI model.
        """
        height, width = frame.shape[:2]
        rows, cols = self.grid_size
        
        cell_h = height / rows
        cell_w = width / cols
        
        grid_counts = np.zeros(self.grid_size)
        
        for det in detections:
            x1, y1, x2, y2 = det[:4]
            cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
            
            grid_x = min(int(cx / cell_w), cols - 1)
            grid_y = min(int(cy / cell_h), rows - 1)
            
            grid_counts[grid_y, grid_x] += 1

        # Calculate density score from YOLO
        capacity_per_zone = 10 
        max_zone_count = np.max(grid_counts)
        yolo_density_score = min((max_zone_count / capacity_per_zone) * 100, 100)
        
        # Predict using AI Model if available
        ai_count = 0
        if self.model:
            ai_count = self._predict_ai_count(frame)
            # Adjust density score based on AI model (more accurate for high density)
            # If AI count is very high, it boosts the density score
            ai_density_score = min((ai_count / (capacity_per_zone * rows * cols * 0.5)) * 100, 100)
            density_score = max(yolo_density_score, ai_density_score)
        else:
            density_score = yolo_density_score
            
        risk_level = self._get_risk_level(density_score)
        
        return {
            "density_score": int(density_score),
            "risk_level": risk_level,
            "yolo_count": len(detections),
            "ai_count": round(ai_count, 1),
            "grid_counts": grid_counts.tolist(),
            "overcrowded_zones": np.where(grid_counts > capacity_per_zone * 0.8, 1, 0).tolist()
        }

    def _predict_ai_count(self, frame):
        """Uses CSRNet to predict crowd count."""
        try:
            # Convert BGR (OpenCV) to RGB (PIL)
            img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            img_tensor = self.transform(img).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                output = self.model(img_tensor)
                count = torch.sum(output).item()
            return count
        except Exception as e:
            print(f"Error in AI prediction: {e}")
            return 0

    def _get_risk_level(self, score):
        if score < self.thresholds["SAFE"]:
            return "SAFE"
        elif score < self.thresholds["WARNING"]:
            return "WARNING"
        elif score < self.thresholds["DANGER"]:
            return "DANGER"
        else:
            return "CRITICAL"
