import React, { useState } from 'react';
import axios from 'axios';
import { Car, AlertCircle, Upload, Video } from 'lucide-react';

// Button Component
function Button({ children, disabled, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

// Loading Indicator Component
function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center space-x-2">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      <span className="text-purple-600 font-semibold">Processing...</span>
    </div>
  );
}

// Navbar Component
function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-4 shadow-lg">
      <div className="container mx-auto flex items-center">
        <Car className="text-white mr-3" size={28} />
        <h1 className="text-2xl font-bold text-white">Parking Space Analyzer</h1>
      </div>
    </nav>
  );
}

// Main App Component
export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [parkingStats, setParkingStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
      setParkingStats(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });

      const statsHeader = response.headers['x-parking-stats'];
      if (statsHeader) {
        try {
          const stats = JSON.parse(statsHeader.replace(/'/g, '"'));
          setParkingStats(stats);
        } catch (e) {
          console.error('Error parsing parking stats:', e);
        }
      }

      const videoBlob = new Blob([response.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error processing video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="container mx-auto p-6 flex-grow">
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Upload className="mr-2 text-purple-600" />
              Upload Parking Lot Video
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <label className="flex-grow">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <div className="cursor-pointer bg-gray-100 text-gray-700 rounded-lg p-4 text-center hover:bg-gray-200 transition duration-300 ease-in-out">
                  {selectedFile ? selectedFile.name : 'Choose a video file'}
                </div>
              </label>
              <Button
                onClick={handleUpload}
                disabled={isLoading || !selectedFile}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Processing...' : 'Analyze Parking Spaces'}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <LoadingIndicator />
            <p className="mt-4 text-gray-600">Analyzing parking spaces. This may take a few moments...</p>
          </div>
        )}

        {videoUrl && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Video className="mr-2 text-pink-600" />
                Analyzed Parking Spaces
              </h2>
              {parkingStats && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-purple-800">Total Spaces</p>
                    <p className="text-3xl font-bold text-purple-600">{parkingStats.total_spaces}</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-green-800">Vacant</p>
                    <p className="text-3xl font-bold text-green-600">{parkingStats.vacant}</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-red-800">Occupied</p>
                    <p className="text-3xl font-bold text-red-600">{parkingStats.occupied}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                <video 
                  controls 
                  className="w-full h-full"
                  autoPlay={false}
                  playsInline
                  preload="auto"
                  key={videoUrl}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-700">Legend:</h3>
                <div className="flex gap-6">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">Vacant Space</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">Occupied Space</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

