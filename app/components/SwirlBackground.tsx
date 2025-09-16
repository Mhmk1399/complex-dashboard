'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  size: number
  color: string
  angle: number
  speed: number
  amplitude: number
}

export default function SwirlBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const colors = ['#90e0ef', '#00b4d8', '#023e8a']

    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = 150

      for (let i = 0; i < particleCount; i++) {
        const baseX = Math.random() * canvas.width
        const baseY = Math.random() * canvas.height
        particles.push({
          x: baseX,
          y: baseY,
          baseX: baseX,
          baseY: baseY,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.015,
          amplitude: Math.random() * 50 + 20
        })
      }
      return particles
    }

    const animate = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(particle => {
        // Sine wave motion
        particle.angle += particle.speed
        particle.x = particle.baseX + Math.sin(particle.angle) * particle.amplitude
        particle.y = particle.baseY + Math.cos(particle.angle * 0.7) * particle.amplitude * 0.5

        // Wrap around edges
        if (particle.x < -10) particle.baseX = canvas.width + 10
        if (particle.x > canvas.width + 10) particle.baseX = -10
        if (particle.y < -10) particle.baseY = canvas.height + 10
        if (particle.y > canvas.height + 10) particle.baseY = -10

        // Draw particle with opacity
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + '80'
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    particlesRef.current = createParticles()
    
    // Clear canvas with white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    animate()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
    />
  )
}