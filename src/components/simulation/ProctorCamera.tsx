'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Eye } from 'lucide-react'

interface ProctorCameraProps {
  onCheatDetected: () => void
  cheatCount: number
}

export function ProctorCamera({ onCheatDetected, cheatCount }: ProctorCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
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
      <div className="relative w-36 h-28 rounded-md overflow-hidden border border-white/15 bg-[#121A2B] shadow-xl">
        {cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
            <AlertTriangle size={18} className="text-danger-soft" />
            <span className="text-[9px] uppercase tracking-wider text-white/50 text-center font-semibold">
              Kamera yoxdur
            </span>
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" aria-hidden="true" />
            <Eye size={10} className="text-paper/90" aria-hidden="true" />
            <span className="text-paper text-[9px] font-semibold uppercase tracking-[0.12em]">
              Live proctor
            </span>
          </div>
        </div>
        {cheatCount > 0 && (
          <div className="absolute top-1.5 left-1.5">
            <span className="bg-danger text-paper text-[10px] font-bold px-1.5 py-0.5 rounded-sm font-mono">
              {cheatCount}/3
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
