import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { containerVariants } from '../../constants/animations'
import useFileUpload from '../../hooks/useFileUpload'
import Navbar from '../layout/Navbar'
import Button from '../common/Button'
import LoadingIndicator from './LoadingIndicator'

export default function FileUploader() {
  const {
    selectedFile,
    videoUrl,
    parkingStats,
    isLoading,
    error,
    handleFileChange,
    handleUpload
  } = useFileUpload()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-4 flex-grow">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="bg-white rounded-lg shadow-md mb-6 border-t-4 border-purple-500"
        >
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
        </motion.div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <LoadingIndicator />
            <p className="mt-4 text-gray-600">Processing video and analyzing parking spaces...</p>
          </div>
        )}

        {videoUrl && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-white rounded-lg shadow-md border-t-4 border-pink-500"
          >
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
          </motion.div>
        )}
      </div>
    </div>
  )
} 