import numpy as np
from tensorflow.keras.models import load_model
from violence.preprocess import ViolencePreprocessor
import os
import cv2

class ViolencePredictor:
    def __init__(self, model_path='models/trained_models/fight_detection_model.h5'):
        self.model_path = model_path
        self.model = None
        self.preprocessor = ViolencePreprocessor()
        self.frame_buffer = []
        
        if os.path.exists(model_path):
            try:
                # Load model with compile=False to avoid BatchNormalization version errors
                self.model = load_model(model_path, compile=False)
                # Re-compile manually for prediction
                self.model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
                print(f"Violence model loaded successfully from {model_path}")
            except Exception as e:
                print(f"Error loading violence model: {e}")
                self.model = None
        else:
            print(f"Warning: Model file {model_path} not found.")

    def predict_from_frames(self, frames):
        """
        Predicts violence from a sequence of frames.
        Expects a list of frames (images).
        """
        if self.model is None:
            return {"fight_detected": False, "confidence": 0.0}

        # Preprocess frames
        processed_frames = []
        for frame in frames:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, self.preprocessor.img_size)
            frame = frame / 255.0
            processed_frames.append(frame)
        
        # Ensure correct sequence length
        if len(processed_frames) > self.preprocessor.sequence_length:
            processed_frames = processed_frames[-self.preprocessor.sequence_length:]
        elif len(processed_frames) < self.preprocessor.sequence_length:
            padding = [np.zeros((self.preprocessor.img_size[0], self.preprocessor.img_size[1], 3))] * (self.preprocessor.sequence_length - len(processed_frames))
            processed_frames.extend(padding)
            
        input_data = np.expand_dims(np.array(processed_frames), axis=0)
        prediction = self.model.predict(input_data, verbose=0)[0][0]
        
        return {
            "fight_detected": bool(prediction > 0.5),
            "confidence": float(prediction)
        }

    def update_and_predict(self, frame):
        """
        Maintains a rolling buffer of frames and predicts.
        """
        self.frame_buffer.append(frame)
        if len(self.frame_buffer) > self.preprocessor.sequence_length:
            self.frame_buffer.pop(0)
            
        if len(self.frame_buffer) == self.preprocessor.sequence_length:
            return self.predict_from_frames(self.frame_buffer)
        
        return {"fight_detected": False, "confidence": 0.0}
