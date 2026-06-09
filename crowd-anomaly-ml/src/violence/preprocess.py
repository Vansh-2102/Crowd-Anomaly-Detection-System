import cv2
import numpy as np
import os
import tensorflow as tf

class ViolencePreprocessor:
    def __init__(self, sequence_length=15, img_size=(160, 160)):
        self.sequence_length = sequence_length
        self.img_size = img_size

    def extract_frames(self, video_path):
        """
        Extracts frames from a video and resizes them.
        """
        frames = []
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return np.zeros((self.sequence_length, self.img_size[0], self.img_size[1], 3))

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Determine sampling interval to get exactly sequence_length frames
        skip_frames_window = max(int(total_frames / self.sequence_length), 1)
        
        for i in range(self.sequence_length):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i * skip_frames_window)
            success, frame = cap.read()
            if not success:
                break
            
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame = cv2.resize(frame, self.img_size)
            frame = frame / 255.0  # Normalize
            frames.append(frame)
            
        cap.release()
        
        if len(frames) < self.sequence_length:
            # Pad if necessary
            padding = [np.zeros((self.img_size[0], self.img_size[1], 3))] * (self.sequence_length - len(frames))
            frames.extend(padding)
        elif len(frames) > self.sequence_length:
            frames = frames[:self.sequence_length]
            
        return np.array(frames)

class ViolenceDataGenerator(tf.keras.utils.Sequence):
    """
    Custom Data Generator to load video sequences in batches.
    """
    def __init__(self, video_paths, labels, batch_size=16, sequence_length=15, img_size=(160, 160), shuffle=True, **kwargs):
        super().__init__(**kwargs)
        self.video_paths = video_paths
        self.labels = labels
        self.batch_size = batch_size
        self.sequence_length = sequence_length
        self.img_size = img_size
        self.shuffle = shuffle
        self.preprocessor = ViolencePreprocessor(sequence_length, img_size)
        self.indexes = np.arange(len(self.video_paths))
        self.on_epoch_end()

    def __len__(self):
        return int(np.floor(len(self.video_paths) / self.batch_size))

    def __getitem__(self, index):
        indexes = self.indexes[index * self.batch_size:(index + 1) * self.batch_size]
        
        batch_video_paths = [self.video_paths[k] for k in indexes]
        batch_labels = [self.labels[k] for k in indexes]
        
        X, y = self.data_generation(batch_video_paths, batch_labels)
        return X, y

    def on_epoch_end(self):
        self.indexes = np.arange(len(self.video_paths))
        if self.shuffle:
            np.random.shuffle(self.indexes)

    def data_generation(self, batch_video_paths, batch_labels):
        X = np.empty((self.batch_size, self.sequence_length, *self.img_size, 3))
        y = np.empty((self.batch_size), dtype=int)

        for i, (path, label) in enumerate(zip(batch_video_paths, batch_labels)):
            X[i,] = self.preprocessor.extract_frames(path)
            y[i] = label

        return X, y

def get_video_paths_and_labels(data_dir):
    """
    Collects all video paths and their corresponding labels.
    """
    video_paths = []
    labels = []
    categories = {'Fight': 1, 'NonFight': 0}
    # Check for 'train' and 'val' subfolders
    subfolders = ['train', 'val']
    
    # If train/val don't exist, check the root data_dir directly
    has_subfolders = any(os.path.exists(os.path.join(data_dir, sub)) for sub in subfolders)
    
    if has_subfolders:
        for sub in subfolders:
            path = os.path.join(data_dir, sub)
            if not os.path.exists(path):
                continue
                
            for category, label in categories.items():
                cat_path = os.path.join(path, category)
                if not os.path.exists(cat_path):
                    continue
                    
                videos = [f for f in os.listdir(cat_path) if f.endswith(('.mp4', '.avi'))]
                for video in videos:
                    video_paths.append(os.path.join(cat_path, video))
                    labels.append(label)
    else:
        # Check root dir for Fight/NonFight
        for category, label in categories.items():
            cat_path = os.path.join(data_dir, category)
            if not os.path.exists(cat_path):
                continue
                
            videos = [f for f in os.listdir(cat_path) if f.endswith(('.mp4', '.avi'))]
            for video in videos:
                video_paths.append(os.path.join(cat_path, video))
                labels.append(label)
                
    return video_paths, labels
