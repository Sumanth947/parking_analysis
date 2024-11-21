import React from 'react'

export default function Button({ children, disabled, onClick, className = '' }) {
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