"use client";
import React from 'react'
import LoadingModal from '../components/LoadingModal'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100">
      <LoadingModal 
        isOpen={true} 
        onComplete={() => console.log('Modal completed')} 
      />
      
    </div>
  )
}
