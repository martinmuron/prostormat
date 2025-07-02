"use client"

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particles for dynamic background effect
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      life: number
      maxLife: number
      hue: number
    }> = []

    // Floating orbs with gravitational effect
    const orbs: Array<{
      x: number
      y: number
      targetX: number
      targetY: number
      size: number
      pulse: number
      speed: number
      color: string
    }> = []

    // Create orbs
    for (let i = 0; i < 5; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        size: 40 + Math.random() * 60,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.003,
        color: i % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)'
      })
    }

    let animationFrame: number
    let time = 0
    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    const createParticle = (x: number, y: number) => {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife: 60 + Math.random() * 120,
        hue: Math.random() * 60 + 200 // Blue to white range
      })
    }

    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Animated gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `hsla(${220 + Math.sin(time * 0.5) * 10}, 15%, 8%, 0.1)`)
      gradient.addColorStop(0.5, `hsla(${200 + Math.cos(time * 0.3) * 15}, 20%, 12%, 0.05)`)
      gradient.addColorStop(1, `hsla(${240 + Math.sin(time * 0.7) * 20}, 10%, 5%, 0.15)`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw orbs
      orbs.forEach((orb, index) => {
        // Move towards target with mouse influence
        const mouseDistance = Math.sqrt((mouseX - orb.x) ** 2 + (mouseY - orb.y) ** 2)
        const mouseInfluence = Math.max(0, (200 - mouseDistance) / 200) * 0.02

        const dx = orb.targetX - orb.x + (mouseX - orb.x) * mouseInfluence
        const dy = orb.targetY - orb.y + (mouseY - orb.y) * mouseInfluence
        
        orb.x += dx * orb.speed
        orb.y += dy * orb.speed

        // Set new target
        if (Math.abs(dx) < 50 && Math.abs(dy) < 50 && Math.random() < 0.01) {
          orb.targetX = Math.random() * canvas.width
          orb.targetY = Math.random() * canvas.height
        }

        // Pulsing effect
        orb.pulse += 0.03
        const currentSize = orb.size + Math.sin(orb.pulse) * 10

        // Draw orb with glow effect
        const orbGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentSize * 2)
        orbGradient.addColorStop(0, orb.color)
        orbGradient.addColorStop(0.3, orb.color.replace(/[\d.]+\)/, '0.01)'))
        orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        
        ctx.fillStyle = orbGradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, currentSize * 2, 0, Math.PI * 2)
        ctx.fill()

        // Create particles around orbs occasionally
        if (Math.random() < 0.05) {
          createParticle(
            orb.x + (Math.random() - 0.5) * currentSize,
            orb.y + (Math.random() - 0.5) * currentSize
          )
        }
      })

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.life++
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.995
        particle.vy *= 0.995

        const alpha = particle.opacity * (1 - particle.life / particle.maxLife)
        
        if (alpha > 0) {
          ctx.fillStyle = `hsla(${particle.hue}, 70%, 80%, ${alpha})`
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          particles.splice(index, 1)
        }
      })

      // Draw connecting lines between orbs with energy effect
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const orb1 = orbs[i]
          const orb2 = orbs[j]
          const distance = Math.sqrt((orb1.x - orb2.x) ** 2 + (orb1.y - orb2.y) ** 2)

          if (distance < 300) {
            const opacity = (0.1 * (1 - distance / 300))
            
            // Animated line with wave effect
            ctx.beginPath()
            ctx.moveTo(orb1.x, orb1.y)
            
            const midX = (orb1.x + orb2.x) / 2
            const midY = (orb1.y + orb2.y) / 2
            const waveOffset = Math.sin(time + i * j) * 20
            
            ctx.quadraticCurveTo(
              midX + waveOffset,
              midY + waveOffset,
              orb2.x,
              orb2.y
            )
            
            const lineGradient = ctx.createLinearGradient(orb1.x, orb1.y, orb2.x, orb2.y)
            lineGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`)
            lineGradient.addColorStop(0.5, `rgba(100, 150, 255, ${opacity * 1.5})`)
            lineGradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`)
            
            ctx.strokeStyle = lineGradient
            ctx.lineWidth = 2 + Math.sin(time * 2) * 0.5
            ctx.stroke()
          }
        }
      }

      // Floating geometric shapes with physics
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      
      for (let i = 0; i < 3; i++) {
        ctx.save()
        ctx.rotate(time * (0.1 + i * 0.05))
        ctx.translate(100 + i * 50, 0)
        ctx.rotate(time * (0.2 - i * 0.1))
        
        const size = 20 + Math.sin(time + i) * 5
        ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + Math.sin(time + i) * 0.01})`
        ctx.fillRect(-size/2, -size/2, size, size)
        
        ctx.restore()
      }
      
      ctx.restore()

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.6 }}
    />
  )
}

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Dynamic floating geometric shapes with enhanced animations */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-white/15 to-white/5 rounded-full blur-sm animate-float-slow hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-tr from-blue-500/10 to-purple-500/5 rounded-lg rotate-45 blur-sm animate-float-medium hover:rotate-90 transition-transform duration-1000" />
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-bl from-white/12 to-gray-500/8 rounded-full blur-sm animate-float-fast" />
      <div className="absolute bottom-20 right-10 w-18 h-18 bg-gradient-to-tl from-indigo-500/8 to-white/6 rounded-lg rotate-12 blur-sm animate-float-slow" />
      <div className="absolute top-60 left-1/2 w-14 h-14 bg-gradient-to-r from-white/10 to-cyan-500/6 rounded-full blur-sm animate-float-medium" />
      
      {/* Additional dynamic shapes with glow effects */}
      <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-br from-white/8 to-blue-500/4 rounded-full animate-float-fast shadow-2xl shadow-blue-500/20" />
      <div className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-gradient-to-tr from-white/6 to-purple-500/3 rounded-lg rotate-45 animate-float-slow shadow-xl shadow-purple-500/10" />
      
      {/* New animated elements */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-gradient-to-r from-cyan-500/15 to-white/8 rounded-full animate-pulse animate-float-medium" />
      <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-gradient-to-bl from-white/12 to-indigo-500/6 rounded-lg rotate-90 animate-float-fast" />
    </div>
  )
}

// Custom CSS animations will be added to globals.css