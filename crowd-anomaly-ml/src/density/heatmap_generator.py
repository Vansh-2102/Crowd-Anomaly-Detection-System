import cv2
import numpy as np
from scipy.ndimage import gaussian_filter

class HeatmapGenerator:
    def __init__(self, kernel_size=15, alpha=0.6):
        self.kernel_size = kernel_size
        self.alpha = alpha

    def generate_heatmap(self, frame, detections):
        """
        Generates a crowd heatmap and overlays it on the frame.
        """
        height, width = frame.shape[:2]
        heatmap = np.zeros((height, width), dtype=np.float32)

        for det in detections:
            x1, y1, x2, y2 = det[:4]
            cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
            
            # Ensure centers are within bounds
            cx = min(max(cx, 0), width - 1)
            cy = min(max(cy, 0), height - 1)
            
            heatmap[cy, cx] += 1

        # Apply Gaussian smoothing to create the heatmap effect
        heatmap = gaussian_filter(heatmap, sigma=self.kernel_size)

        # Normalize heatmap to 0-255
        if np.max(heatmap) > 0:
            heatmap = (heatmap / np.max(heatmap) * 255).astype(np.uint8)
        else:
            heatmap = heatmap.astype(np.uint8)

        # Apply colormap (COLORMAP_JET: Blue-Green-Yellow-Red)
        heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        # Create a mask where heatmap has values
        # We only want to overlay the heatmap where there's actually some density
        mask = heatmap > 5 # Threshold to avoid showing faint blue in empty areas
        
        # Initialize overlay as the original frame
        overlay = frame.copy()
        
        # Apply the colored heatmap only where the mask is true
        # We compute the weighted sum for the whole image and then pick only the masked pixels
        heatmap_overlay = cv2.addWeighted(frame, 1 - self.alpha, heatmap_color, self.alpha, 0)
        overlay[mask] = heatmap_overlay[mask]

        return overlay
