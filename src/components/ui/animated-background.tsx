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

    // Moving line nodes that create location-like shapes
    const nodes: Array<{
      x: number
      y: number
      targetX: number
      targetY: number
      speed: number
      hue: number
      size: number
    }> = []

    // Create nodes
    for (let i = 0; i < 8; i++) {
      const node = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
        speed: 0.002 + Math.random() * 0.003,
        hue: 200 + Math.random() * 60, // Blue to purple range
        size: 4 + Math.random() * 6
      }
      nodes.push(node)
    }

    let animationFrame: number
    let time = 0

    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update node positions towards targets
      nodes.forEach((node, index) => {
        // Move towards target
        const dx = node.targetX - node.x
        const dy = node.targetY - node.y
        node.x += dx * node.speed
        node.y += dy * node.speed

        // Set new target when close enough
        if (Math.abs(dx) < 50 && Math.abs(dy) < 50) {
          node.targetX = Math.random() * canvas.width
          node.targetY = Math.random() * canvas.height
        }

        // Add some organic movement
        node.x += Math.sin(time + index) * 0.5
        node.y += Math.cos(time + index * 0.7) * 0.5

        // Draw node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 2)
        gradient.addColorStop(0, `hsla(${node.hue}, 70%, 60%, 0.8)`)
        gradient.addColorStop(1, `hsla(${node.hue}, 70%, 60%, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Draw dynamic lines between nodes creating location-like areas
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i]
          const node2 = nodes[j]
          const dx = node1.x - node2.x
          const dy = node1.y - node2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 300) {
            // Create flowing gradient lines
            const gradient = ctx.createLinearGradient(node1.x, node1.y, node2.x, node2.y)
            gradient.addColorStop(0, `hsla(${node1.hue}, 70%, 60%, ${0.3 * (1 - distance / 300)})`)
            gradient.addColorStop(0.5, `hsla(${(node1.hue + node2.hue) / 2}, 70%, 60%, ${0.5 * (1 - distance / 300)})`)
            gradient.addColorStop(1, `hsla(${node2.hue}, 70%, 60%, ${0.3 * (1 - distance / 300)})`)

            ctx.beginPath()
            ctx.moveTo(node1.x, node1.y)
            
            // Create curved lines for more organic feel
            const midX = (node1.x + node2.x) / 2 + Math.sin(time + i + j) * 30
            const midY = (node1.y + node2.y) / 2 + Math.cos(time + i + j) * 30
            ctx.quadraticCurveTo(midX, midY, node2.x, node2.y)
            
            ctx.strokeStyle = gradient
            ctx.lineWidth = 2 + Math.sin(time + distance * 0.01) * 1
            ctx.stroke()

            // Add location area fills
            if (distance < 200) {
              ctx.beginPath()
              ctx.arc(midX, midY, 40 + Math.sin(time * 2 + i) * 10, 0, Math.PI * 2)
              const areaGradient = ctx.createRadialGradient(midX, midY, 0, midX, midY, 60)
              areaGradient.addColorStop(0, `hsla(${(node1.hue + node2.hue) / 2}, 60%, 50%, 0.1)`)
              areaGradient.addColorStop(1, `hsla(${(node1.hue + node2.hue) / 2}, 60%, 50%, 0)`)
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
      style={{ opacity: 0.4 }}
    />
  )
}

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-xl animate-float-slow" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 rounded-lg rotate-45 blur-lg animate-float-medium" />
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-float-fast" />
      <div className="absolute bottom-20 right-10 w-18 h-18 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-lg rotate-12 blur-lg animate-float-slow" />
      <div className="absolute top-60 left-1/2 w-14 h-14 bg-gradient-to-br from-purple-400/30 to-blue-500/30 rounded-full blur-lg animate-float-medium" />
    </div>
  )
}

// Custom CSS animations will be added to globals.css