from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import TimeDistributed, Conv2D, MaxPooling2D, Flatten, LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.applications import MobileNetV2

def build_violence_model(input_shape=(15, 160, 160, 3)):
    """
    Builds a CNN-LSTM model for violence detection.
    Using MobileNetV2 as a base for efficiency.
    """
    model = Sequential()
    
    # Pre-trained CNN base
    base_cnn = MobileNetV2(weights='imagenet', include_top=False, input_shape=input_shape[1:])
    base_cnn.trainable = False
    
    # TimeDistributed wrapper for the CNN
    model.add(TimeDistributed(base_cnn, input_shape=input_shape))
    model.add(TimeDistributed(Flatten()))
    
    # LSTM layers
    model.add(LSTM(64, return_sequences=False))
    model.add(Dropout(0.5))
    
    # Fully connected layers
    model.add(Dense(64, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dense(1, activation='sigmoid'))
    
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    
    return model
