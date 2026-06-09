import os
import sys
import numpy as np
import tensorflow as tf

# Add src to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from violence.model import build_violence_model
from violence.preprocess import ViolenceDataGenerator, get_video_paths_and_labels
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.model_selection import train_test_split

def train_violence_model(data_dir, model_save_path='models/trained_models/fight_detection_model.h5', initial_epoch=0):
    """
    Script to train the violence detection model with GPU support.
    """
    # Create models directory if it doesn't exist
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    # Check for GPU
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"Found GPU: {gpus[0].name}. Training on RTX 4050...")
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError as e:
            print(e)
    else:
        print("No GPU found. Training on CPU will be very slow.")

    # Collect paths
    video_paths, labels = get_video_paths_and_labels(data_dir)
    
    if len(video_paths) == 0:
        print("Error: No data found. Check your dataset folder structure.")
        return

    # Split data
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        video_paths, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    print(f"Training on {len(train_paths)} samples, Validating on {len(val_paths)} samples.")
    
    # Adjust batch size for GPU efficiency with smaller images
    batch_size = 16  # Confirmed for RTX 4050 with 160x160 images
    train_gen = ViolenceDataGenerator(train_paths, train_labels, batch_size=batch_size)
    val_gen = ViolenceDataGenerator(val_paths, val_labels, batch_size=batch_size)

    # Resume logic: Load existing model if it exists
    if os.path.exists(model_save_path):
        print(f"Loading existing model from {model_save_path} to resume training...")
        try:
            # Load the model structure and weights with compile=False to avoid version mismatches
            model = tf.keras.models.load_model(model_save_path, compile=False)
            # Re-compile manually with the current environment's optimizer
            model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
            print("Model loaded and re-compiled successfully.")
        except Exception as e:
            print(f"Error loading model: {e}. Building a new one.")
            model = build_violence_model(input_shape=(15, 160, 160, 3))
    else:
        print("No existing model found. Building a new model...")
        model = build_violence_model(input_shape=(15, 160, 160, 3))
    
    callbacks = [
        ModelCheckpoint(model_save_path, save_best_only=True, monitor='val_loss', verbose=1),
        EarlyStopping(patience=10, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(factor=0.2, patience=4, verbose=1)
    ]
    
    print(f"Starting training from epoch {initial_epoch}...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=50, # Keep epochs same as requested
        initial_epoch=initial_epoch,
        callbacks=callbacks,
        verbose=1
    )
    
    print(f"Training Complete! Model saved to {model_save_path}")
    return history

if __name__ == "__main__":
    # Get absolute path to datasets folder
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Priority path as confirmed by user
    dataset_path = os.path.join(base_dir, 'datasets', 'RWF-2000_ready')
    
    if not os.path.exists(dataset_path):
        # Fallback to other possible paths
        possible_paths = [
            os.path.join(base_dir, 'datasets', 'RWF-2000'),
            os.path.join(base_dir, 'datasets', 'RWD-2000'),
            os.path.join(base_dir, 'crowd-anomaly-ml', 'datasets', 'RWF-2000_ready')
        ]
        for p in possible_paths:
            if os.path.exists(p):
                dataset_path = p
                break
    
    if dataset_path and os.path.exists(dataset_path):
        print(f"Using dataset at: {dataset_path}")
        
        # Ask user for starting epoch if they want to resume
        start_epoch = 0
        if os.path.exists('models/trained_models/fight_detection_model.h5'):
            try:
                val = input("Existing model found. Enter the epoch to resume from (or press Enter for 0): ")
                if val.strip():
                    start_epoch = int(val)
            except EOFError:
                # Handle non-interactive environments
                start_epoch = 0
            except ValueError:
                print("Invalid input. Starting from epoch 0.")
        
        train_violence_model(dataset_path, initial_epoch=start_epoch)
    else:
        print(f"Error: Dataset folder 'RWF-2000_ready' not found at {dataset_path}")
        print("Please ensure the dataset is unzipped in the 'datasets' folder.")
