import React, { useState } from 'react'
import axios from 'axios'
import { Car, AlertCircle } from 'lucide-react'

// Button Component
function Button({ children, disabled, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

// Loading Indicator Component
function LoadingIndicator() {
  return (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  )
}

// Navbar Component
function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4 shadow-lg">
      <div className="container mx-auto flex items-center">
        <Car className="text-white mr-2" size={24} />
        <h1 className="text-2xl font-bold text-white">Parking Space Analyzer</h1>
      </div>
    </nav>
  )
}

// Main App Component
export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [parkingStats, setParkingStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
        setVideoUrl(null)
      }
      setParkingStats(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      })

      const statsHeader = response.headers['x-parking-stats']
      if (statsHeader) {
        try {
          const stats = JSON.parse(statsHeader.replace(/'/g, '"'))
          setParkingStats(stats)
        } catch (e) {
          console.error('Error parsing parking stats:', e)
        }
      }

      const videoBlob = new Blob([response.data], { type: 'video/mp4' })
      const url = URL.createObjectURL(videoBlob)
      setVideoUrl(url)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Error processing video. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-4 flex-grow">
        <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-purple-500">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Upload Parking Lot Video</h2>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*"
                className="border p-2 rounded-md w-full sm:w-auto"
              />
              <Button
                onClick={handleUpload}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Analyze Parking Spaces'}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
                <AlertCircle className="mr-2" />
                {error}
              </div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <LoadingIndicator />
            <p className="mt-4 text-gray-600">Processing video and analyzing parking spaces...</p>
          </div>
        )}

        {videoUrl && (
          <div className="bg-white rounded-lg shadow-md border-t-4 border-pink-500">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Analyzed Parking Spaces</h2>
              {parkingStats && (
                <div className="mt-2 text-gray-600">
                  <p>Total parking spaces: {parkingStats.total_spaces}</p>
                  <p>Occupied: {parkingStats.occupied}</p>
                  <p>Vacant: {parkingStats.vacant}</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="relative aspect-video">
                <video 
                  controls 
                  className="w-full h-full rounded-lg shadow-lg"
                  autoPlay={false}
                  playsInline
                  preload="auto"
                  key={videoUrl}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Legend:</h3>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span>Vacant Space</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span>Occupied Space</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
