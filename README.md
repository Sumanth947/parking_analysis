# Parking Space Analyzer

This project is a video-based parking space analyzer that detects whether a parking spot is occupied or vacant. The backend is built using Flask and the frontend uses React to provide an interactive user interface. The trained machine learning model is used to classify parking spaces in each frame of the uploaded video.

## Features

- **Video Upload**: Upload a video of a parking area.
- **Parking Space Detection**: The backend processes each frame and detects whether a parking space is occupied or vacant.
- **Real-time Video Playback**: View the processed video with bounding boxes drawn on the detected parking spaces, indicating whether they are occupied or vacant.
- **Model Retraining**: The model is capable of being retrained with both marked and unmarked images of parking spaces.

## Technologies Used

- **Frontend**: React.js, Axios
- **Backend**: Flask, OpenCV, TensorFlow (Keras), Flask-CORS
- **Machine Learning**: Convolutional Neural Network (CNN) for image classification and object detection
- **Video Processing**: OpenCV for reading and processing video frames
- **File Handling**: Multipart form-data for video upload and download

---

## Project Setup

### Prerequisites

- Python 3.x
- Node.js and npm (for React frontend)
- TensorFlow (with Keras)
- OpenCV
- Flask
- Flask-CORS

### Backend Setup

1. Clone the repository and navigate to the backend directory:
    ```bash
    git clone <repository_url>
    cd Parking_Space/backend
    ```

2. Install the necessary Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3. Ensure your model file (`parking_model_retrained_with_both.h5`) is available in the backend directory.

4. Run the Flask server:
    ```bash
    python app.py
    ```
    By default, the Flask server will run on `http://127.0.0.1:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd Parking_Space/frontend
    ```

2. Install the necessary Node.js dependencies:
    ```bash
    npm install
    ```

3. Start the React development server:
    ```bash
    npm start
    ```
    By default, the frontend will run on `http://localhost:5173`.

---

## How It Works

1. **Uploading Video**: The user selects a video from their local machine, and the video is sent to the Flask backend for processing.
   
2. **Backend Processing**: 
    - The backend reads each frame of the video using OpenCV.
    - The model is used to predict whether each parking spot is occupied or vacant.
    - Bounding boxes and labels are added to the video frames indicating the status of the parking space.

3. **Displaying Processed Video**: 
    - The processed video is sent back to the frontend as a blob.
    - The frontend renders the processed video using an HTML5 video player with the option to play, pause, and seek the video.

---

## CORS Configuration

To avoid issues with cross-origin requests, CORS (Cross-Origin Resource Sharing) is enabled in the Flask backend. If you're facing CORS issues, ensure the following is included in the Flask app:

```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
