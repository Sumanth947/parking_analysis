from tensorflow.keras.models import load_model
import cv2
import numpy as np
import os

# Load the trained model
model = load_model('parking_model_retrained_boxes.h5')

# Function to process a video and extract frames at specified intervals
def process_video(video_path, interval_seconds=10, output_frame_size=(128, 128)):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)  # Frames per second of the video
    interval_frames = int(fps * interval_seconds)  # Number of frames for the specified interval
    frame_count = 0

    total_frames_processed = 0
    occupied_count = 0
    vacant_count = 0

    if not cap.isOpened():
        print("Error: Could not open video.")
        return

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # End of video

        if frame_count % interval_frames == 0:
            # Resize the frame
            resized_frame = cv2.resize(frame, output_frame_size)
            normalized_frame = resized_frame / 255.0  # Normalize the image
            input_frame = np.expand_dims(normalized_frame, axis=0)  # Add batch dimension

            # Make a prediction
            prediction = model.predict(input_frame)
            total_frames_processed += 1
            print(f'Frame at {frame_count // fps} seconds - Raw Prediction: {prediction[0][0]}')

            # Interpret the prediction
            threshold = 0.5  # Adjust this threshold as needed
            if prediction[0][0] > threshold:
                print(f'Frame at {frame_count // fps} seconds - Prediction: Free parking space')
                vacant_count += 1
            else:
                print(f'Frame at {frame_count // fps} seconds - Prediction: Occupied parking space')
                occupied_count += 1

        frame_count += 1

    cap.release()

    # Print the summary
    print("\nSummary:")
    print(f"Total frames analyzed: {total_frames_processed}")
    print(f"Total parking spaces analyzed: {total_frames_processed}")
    print(f"Occupied: {occupied_count}")
    print(f"Vacant: {vacant_count}")
    print("Finished processing the video.")

# Specify the path to your video file
video_path = './videos/1vid.mp4'  # Replace .mp4 with the correct extension if needed
process_video(video_path, interval_seconds=10)
