from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
from keras.models import load_model
from werkzeug.utils import secure_filename
import tempfile
import shutil

app = Flask(__name__)
CORS(app)

# Create necessary directories
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
MODEL_FOLDER = os.path.join(BASE_DIR, 'model')
TEMP_FOLDER = os.path.join(BASE_DIR, 'temp')

# Ensure directories exist
for folder in [UPLOAD_FOLDER, MODEL_FOLDER, TEMP_FOLDER]:
    os.makedirs(folder, exist_ok=True)
    print(f"Created/verified directory: {folder}")

# Load the pre-trained model
try:
    model = load_model(os.path.join(MODEL_FOLDER, 'parking_model_retrained_combined.h5'))
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

def draw_parking_spaces(frame, predictions):
    # Define more parking spaces
    parking_spaces = [
        [(100, 100), (200, 200)],
        [(250, 100), (350, 200)],
        [(400, 100), (500, 200)],
        [(100, 250), (200, 350)],
        [(250, 250), (350, 350)],
        [(400, 250), (500, 350)],
        [(100, 400), (200, 500)],
        [(250, 400), (350, 500)],
        [(400, 400), (500, 500)],
        [(550, 100), (650, 200)],
        [(700, 100), (800, 200)],
        [(550, 250), (650, 350)],
        [(700, 250), (800, 350)],
        [(550, 400), (650, 500)],
        [(700, 400), (800, 500)],
    ]
    
    occupied_count = 0
    total_spaces = len(parking_spaces)
    
    try:
        for (start_point, end_point), is_occupied in zip(parking_spaces, predictions):
            color = (0, 0, 255) if is_occupied > 0.5 else (0, 255, 0)
            cv2.rectangle(frame, start_point, end_point, color, 2)
            status = "Occupied" if is_occupied > 0.5 else "Vacant"
            cv2.putText(frame, status, (start_point[0], start_point[1] - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            if is_occupied > 0.5:
                occupied_count += 1
    except Exception as e:
        print(f"Error drawing parking spaces: {str(e)}")
    
    # Add statistics overlay
    vacant_count = total_spaces - occupied_count
    stats_text = f"Total Spaces: {total_spaces} | Occupied: {occupied_count} | Vacant: {vacant_count}"
    cv2.putText(frame, stats_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    return frame, {
        'total_spaces': total_spaces,
        'occupied': occupied_count,
        'vacant': vacant_count
    }

def process_video(input_video_path):
    try:
        print(f"Processing video: {input_video_path}")
        
        # Verify input file exists
        if not os.path.exists(input_video_path):
            raise Exception(f"Input video file not found: {input_video_path}")
        
        cap = cv2.VideoCapture(input_video_path)
        if not cap.isOpened():
            raise Exception("Error opening video file")

        # Get video properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        print(f"Video properties - Width: {width}, Height: {height}, FPS: {fps}")

        # Create output video writer
        output_path = os.path.join(TEMP_FOLDER, 'output.mp4')
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        if not out.isOpened():
            raise Exception("Failed to create video writer")

        frame_count = 0
        processed_frames = 0
        latest_stats = None
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Process every 5th frame
            if frame_count % 5 == 0:
                try:
                    # Prepare frame for prediction
                    resized = cv2.resize(frame, (128, 128))
                    normalized = resized / 255.0
                    
                    # Make prediction
                    if model is not None:
                        prediction = model.predict(np.expand_dims(normalized, axis=0))[0]
                        frame, stats = draw_parking_spaces(frame, prediction)
                        latest_stats = stats
                    
                    processed_frames += 1
                except Exception as e:
                    print(f"Error processing frame {frame_count}: {str(e)}")

            out.write(frame)
            frame_count += 1

        cap.release()
        out.release()

        print(f"Processed {processed_frames} frames out of {frame_count} total frames")
        if latest_stats:
            print(f"\nParking Space Statistics:")
            print(f"Total parking spaces: {latest_stats['total_spaces']}")
            print(f"Occupied: {latest_stats['occupied']}")
            print(f"Vacant: {latest_stats['vacant']}")

        if not os.path.exists(output_path):
            raise Exception("Failed to create output video")

        print(f"Video processing completed. Output saved to: {output_path}")
        return output_path, latest_stats

    except Exception as e:
        print(f"Error in process_video: {str(e)}")
        raise

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Received prediction request")
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        # Save uploaded file
        filename = secure_filename(file.filename)
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)
        print(f"File saved to: {input_path}")

        try:
            # Process video and get statistics
            output_path, stats = process_video(input_path)
            
            if not os.path.exists(output_path):
                raise Exception("Output video file not created")

            print(f"Video processed successfully. Size: {os.path.getsize(output_path)} bytes")

            # Return processed video with statistics
            response = send_file(
                output_path,
                mimetype='video/mp4',
                as_attachment=False
            )
            
            # Add statistics to response headers
            response.headers['X-Parking-Stats'] = str(stats)
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            response.headers['Access-Control-Expose-Headers'] = 'X-Parking-Stats'
            
            return response

        except Exception as e:
            print(f"Processing error: {str(e)}")
            return jsonify({"error": f"Error processing video: {str(e)}"}), 500

        finally:
            # Clean up input file
            if os.path.exists(input_path):
                os.remove(input_path)
                print(f"Cleaned up input file: {input_path}")

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "upload_dir": os.path.exists(UPLOAD_FOLDER),
        "temp_dir": os.path.exists(TEMP_FOLDER),
        "model_dir": os.path.exists(MODEL_FOLDER)
    })

if __name__ == '__main__':
    try:
        print("Starting Flask server...")
        print(f"Model folder path: {MODEL_FOLDER}")
        print(f"Model loaded: {model is not None}")
        app.run(debug=True, port=5000)
    except Exception as e:
        print(f"Startup error: {str(e)}")
