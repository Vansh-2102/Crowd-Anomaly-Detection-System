import cv2
import numpy as np

class OpticalFlowDetector:
    def __init__(self):
        self.prev_gray = None

    def calculate_flow(self, frame):
        """
        Calculates Farneback Optical Flow between consecutive frames.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        if self.prev_gray is None:
            self.prev_gray = gray
            return None

        flow = cv2.calcOpticalFlowFarneback(
            self.prev_gray, gray, None, 
            0.5, 3, 15, 3, 5, 1.2, 0
        )
        
        self.prev_gray = gray
        return flow

    def get_motion_vectors(self, flow):
        """
        Extracts magnitude and angle from the flow field.
        """
        if flow is None:
            return None, None
            
        mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        return mag, ang
