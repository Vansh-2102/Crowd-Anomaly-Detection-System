import cv2
import numpy as np

class OpticalFlowDetector:
    def __init__(self):
        self.prev_gray = None

    def calculate_flow(self, frame1, frame2=None):
        """
        Calculates Farneback Optical Flow between consecutive frames.
        Can take either a single frame (uses internal prev_gray) or two frames.
        Always returns a 2-channel flow image (shape: H, W, 2) for cartToPolar.
        """
        if frame2 is None:
            # Single frame mode (for backward compatibility with main.py)
            gray = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
            if self.prev_gray is None:
                self.prev_gray = gray
                return np.zeros((gray.shape[0], gray.shape[1], 2), dtype=np.float32)
            flow = cv2.calcOpticalFlowFarneback(
                self.prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )
            self.prev_gray = gray
        else:
            # Two frames mode (for API use)
            gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
            gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)
            flow = cv2.calcOpticalFlowFarneback(
                gray1, gray2, None, 0.5, 3, 15, 3, 5, 1.2, 0
            )
        return flow

    def get_motion_vectors(self, flow):
        """
        Extracts magnitude and angle from the flow field.
        """
        if flow is None or flow.ndim != 3 or flow.shape[2] != 2:
            h, w = 416, 416
            return np.zeros((h, w), dtype=np.float32), np.zeros((h, w), dtype=np.float32)
            
        mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        return mag, ang
