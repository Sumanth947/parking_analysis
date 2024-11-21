import { useState } from 'react'
import axios from 'axios'

export default function useFileUpload() {
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

  return {
    selectedFile,
    videoUrl,
    parkingStats,
    isLoading,
    error,
    handleFileChange,
    handleUpload
  }
} 