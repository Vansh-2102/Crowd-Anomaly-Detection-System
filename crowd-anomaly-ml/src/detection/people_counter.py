class PeopleCounter:
    def __init__(self, detector):
        self.detector = detector

    def get_count(self, frame):
        """
        Returns the count of people in the current frame.
        """
        result = self.detector.count_people(frame)
        return result["people_count"]

    def get_full_data(self, frame):
        """
        Returns full detection data for the current frame.
        """
        return self.detector.count_people(frame)
