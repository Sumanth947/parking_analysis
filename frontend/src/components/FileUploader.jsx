'use client'

import React, { useState } from 'react'
import axios from 'axios'

export default function Component() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
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
      // Send the video to the Flask backend for processing
      const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob', // We expect a video file in response
      })

      // Create a URL for the video returned from the backend
      const url = URL.createObjectURL(response.data)
      setVideoUrl(url)
    } catch (err) {
      setError('Error uploading file.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4 flex-grow">
        <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-purple-500">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Upload Video</h2>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*"
                className="border p-2 rounded-md w-full sm:w-auto"
              />
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Analyzing...' : 'Upload and Analyze'}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {videoUrl && (
          <div className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-pink-500">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Processed Video</h2>
            </div>
            <div className="p-4">
              <video width="100%" controls>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
