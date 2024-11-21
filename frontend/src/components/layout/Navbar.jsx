import React from 'react'
import { Car } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4 shadow-lg">
      <div className="container mx-auto flex items-center">
        <Car className="text-white mr-2" size={24} />
        <h1 className="text-2xl font-bold text-white">Parking Space Analyzer</h1>
      </div>
    </nav>
  )
} 