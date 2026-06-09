import numpy as np

class StampedeDetector:
    def __init__(self, speed_threshold=4.0, direction_threshold=0.7):
        self.speed_threshold = speed_threshold
        self.direction_threshold = direction_threshold

    def detect_stampede(self, mag, ang):
        """
        Detects stampede based on movement magnitude and directional consistency.
        """
        if mag is None or ang is None:
            return {"stampede": False, "speed": 0.0}

        # Calculate average speed
        avg_speed = np.mean(mag)
        
        # Calculate directional consistency
        # We can use the circular variance or simply check the majority direction
        # Let's bin the angles and see if any bin has > direction_threshold of the vectors
        # Only consider vectors with significant magnitude
        mask = mag > (avg_speed * 0.5)
        if not np.any(mask):
            return {"stampede": False, "speed": float(avg_speed)}

        filtered_ang = ang[mask]
        
        # Histograms of directions (8 bins for 45 degrees each)
        hist, _ = np.histogram(filtered_ang, bins=8, range=(0, 2 * np.pi))
        
        # Consistency score (max bin count / total significant vectors)
        consistency = np.max(hist) / len(filtered_ang)
        
        stampede_detected = (avg_speed > self.speed_threshold) and (consistency > self.direction_threshold)
        
        return {
            "stampede": bool(stampede_detected),
            "speed": round(float(avg_speed), 2),
            "consistency": round(float(consistency), 2)
        }
