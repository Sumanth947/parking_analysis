import os
import cv2
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.utils import to_categorical

# Load images from the 'boxes' folder and preprocess them for training
def load_marked_images(image_dir, target_size=(128, 128)):
    images = []
    labels = []  # Adjust this if you have specific labeling logic
    for img_name in os.listdir(image_dir):
        img_path = os.path.join(image_dir, img_name)
        img = cv2.imread(img_path)
        if img is None:
            print(f"Failed to load image: {img_path}")
            continue

        # Resize and normalize the image
        img_resized = cv2.resize(img, target_size)
        img_normalized = img_resized / 255.0  # Normalize the image
        images.append(img_normalized)

        # Example label assignment logic (adjust as needed)
        label = 1 if 'free' in img_name.lower() else 0  # Update this logic based on your image naming or annotations
        labels.append(label)

    return np.array(images), np.array(labels)

# Load training data from the 'boxes' folder (Boxed Images)
boxed_images, boxed_labels = load_marked_images('./boxes')

# Load training data from the 'unboxed' folder (Unboxed Images)
unboxed_images, unboxed_labels = load_marked_images('./images')

# Combine both datasets (Boxed and Unboxed)
all_images = np.concatenate((boxed_images, unboxed_images), axis=0)
all_labels = np.concatenate((boxed_labels, unboxed_labels), axis=0)

# One-hot encode the labels (for multi-class classification)
all_labels = to_categorical(all_labels, num_classes=2)  # Use 2 for binary classification (Vacant/Occupied)

# Define a simple CNN model for training
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 3)),
    MaxPooling2D(pool_size=(2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(pool_size=(2, 2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dense(2, activation='softmax')  # Use 'softmax' for multi-class (Vacant/Occupied)
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train the model with the combined dataset (boxed and unboxed images)
model.fit(all_images, all_labels, validation_split=0.2, epochs=10, batch_size=32)

# Save the retrained model
model.save('parking_model_retrained_combined.h5')

print("Model training completed and saved!")
