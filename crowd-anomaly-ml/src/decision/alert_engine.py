class AlertEngine:
    def __init__(self, density_threshold=70):
        self.density_threshold = density_threshold

    def get_alert(self, detection_data):
        """
        Determines the alert level based on all detection results.
        """
        people_count = detection_data.get("people_count", 0)
        density_score = detection_data.get("density_score", 0)
        stampede = detection_data.get("stampede", False)
        fight_detected = detection_data.get("fight_detected", False)
        
        alert_level = "SAFE"
        reason = "Normal Activity"
        
        # Check conditions in increasing order of severity
        if density_score > self.density_threshold:
            alert_level = "WARNING"
            reason = f"High Crowd Density: {density_score}"
            
        if stampede:
            alert_level = "DANGER"
            reason = "Stampede/Panic Movement Detected"
            
        if fight_detected:
            alert_level = "CRITICAL"
            reason = "Violence/Fight Detected"
            
        return {
            "alert_level": alert_level,
            "reason": reason,
            "people_count": people_count,
            "density_score": density_score,
            "stampede": stampede,
            "fight_detected": fight_detected
        }
