'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ProctorCameraProps {
  onCheatDetected: () => void
  cheatCount: number
}

export function ProctorCamera({ onCheatDetected, cheatCount }: ProctorCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const cheatCallbackRef = useRef(onCheatDetected)

  useEffect(() => {
    cheatCallbackRef.current = onCheatDetected
  }, [onCheatDetected])

  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
        }
      } catch {
        setCameraError(true)
      }
    }

    startCamera()

    const handleVisibilityChange = () => {
      if (document.hidden) cheatCallbackRef.current()
    }
    const handleBlur = () => cheatCallbackRef.current()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    document.documentElement.requestFullscreen?.().catch(() => null)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      stream?.getTracks().forEach((t) => t.stop())
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => null)
      }
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative w-32 h-24 rounded-lg overflow-hidden border-2 border-teal-500 shadow-lg shadow-teal-500/20">
        {cameraError ? (
          <div className="w-full h-full bg-[#162035] flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-1 left-1 flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-[10px] font-medium drop-shadow">AI izləyir</span>
        </div>
        {cheatCount > 0 && (
          <div className="absolute top-1 left-1">
            <span className="bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">
              ⚠️ {cheatCount}/3
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
