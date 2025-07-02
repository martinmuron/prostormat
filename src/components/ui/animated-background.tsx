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

    // Moving line nodes that create minimal geometric patterns
    const nodes: Array<{
      x: number
      y: number
      targetX: number
      targetY: number
      speed: number
      opacity: number
      size: number
    }> = []

    // Create nodes
    for (let i = 0; i < 6; i++) {
      const node = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        speed: 0.001 + Math.random() * 0.002,
        opacity: 0.1 + Math.random() * 0.2,
        size: 2 + Math.random() * 4
      }
      nodes.push(node)
    }

    let animationFrame: number
    let time = 0

    const animate = () => {
      time += 0.005
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update node positions towards targets
      nodes.forEach((node, index) => {
        // Move towards target
        const dx = node.targetX - node.x
        const dy = node.targetY - node.y
        node.x += dx * node.speed
        node.y += dy * node.speed

        // Set new target when close enough
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
          node.targetX = Math.random() * canvas.width
          node.targetY = Math.random() * canvas.height
        }

        // Add subtle organic movement
        node.x += Math.sin(time + index) * 0.3
        node.y += Math.cos(time + index * 0.7) * 0.3

        // Draw minimal node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3)
        gradient.addColorStop(0, `rgba(0, 0, 0, ${node.opacity})`)
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Draw clean minimal lines between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i]
          const node2 = nodes[j]
          const dx = node1.x - node2.x
          const dy = node1.y - node2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 250) {
            const opacity = (0.15 * (1 - distance / 250)) * (node1.opacity + node2.opacity) / 2

            ctx.beginPath()
            ctx.moveTo(node1.x, node1.y)
            ctx.lineTo(node2.x, node2.y)
            
            ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()

            // Add subtle geometric areas
            if (distance < 150) {
              const midX = (node1.x + node2.x) / 2
              const midY = (node1.y + node2.y) / 2
              
              ctx.beginPath()
              ctx.arc(midX, midY, 20 + Math.sin(time * 1.5 + i) * 5, 0, Math.PI * 2)
              const areaGradient = ctx.createRadialGradient(midX, midY, 0, midX, midY, 30)
              areaGradient.addColorStop(0, `rgba(0, 0, 0, ${opacity * 0.3})`)
              areaGradient.addColorStop(1, `rgba(0, 0, 0, 0)`)
              ctx.fillStyle = areaGradient
              ctx.fill()
            }
          }
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
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
      {/* Minimal floating geometric shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full blur-sm animate-float-slow" />
      <div className="absolute top-40 right-20 w-12 h-12 bg-black/5 rounded-lg rotate-45 blur-sm animate-float-medium" />
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/8 rounded-full blur-sm animate-float-fast" />
      <div className="absolute bottom-20 right-10 w-14 h-14 bg-black/8 rounded-lg rotate-12 blur-sm animate-float-slow" />
      <div className="absolute top-60 left-1/2 w-10 h-10 bg-white/6 rounded-full blur-sm animate-float-medium" />
      
      {/* Additional minimal shapes for depth */}
      <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-black/4 rounded-full animate-float-fast" />
      <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-white/5 rounded-lg rotate-45 animate-float-slow" />
    </div>
  )
}

// Custom CSS animations will be added to globals.css