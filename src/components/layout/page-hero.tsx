"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageHeroVariant = "default" | "soft" | "plain"
type PageHeroAlign = "center" | "left"
type PageHeroSize = "lg" | "md"

interface PageHeroProps {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  align?: PageHeroAlign
  variant?: PageHeroVariant
  size?: PageHeroSize
  className?: string
  containerClassName?: string
}

const variantStyles: Record<PageHeroVariant, string> = {
  default: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
  soft: "bg-gradient-to-br from-slate-50 via-white to-blue-50/40",
  plain: "bg-white",
}

const sizeStyles: Record<PageHeroSize, string> = {
  lg: "py-20 sm:py-24",
  md: "py-16 sm:py-20",
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  actions,
  align = "center",
  variant = "default",
  size = "lg",
  className,
  containerClassName,
}: PageHeroProps) {
  const contentAlignment = align === "left" ? "items-start text-left" : "items-center text-center"
  const actionsAlignment = align === "left" ? "justify-start" : "justify-center"

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-gray-200",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      <BackgroundDecor />

      <div className={cn("relative z-10 px-4 sm:px-6", containerClassName)}>
        <div className={cn("max-w-4xl mx-auto flex flex-col gap-6", contentAlignment)}>
          {eyebrow ? (
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-blue-600 shadow-sm">
              {eyebrow}
            </div>
          ) : null}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 leading-tight">
            {title}
          </h1>

          {subtitle ? (
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          ) : null}

          {actions ? (
            <div className={cn("flex flex-wrap gap-4", actionsAlignment)}>
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(124,58,237,0.08),transparent_55%)]" />
      <div className="absolute inset-0 opacity-60" style={{
        backgroundImage:
          "linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="absolute -top-16 left-10 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl animate-float-slow" />
      <div className="absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-indigo-100/50 blur-3xl animate-float-medium" />
      <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-purple-100/40 blur-3xl animate-float-fast" />
      <div className="absolute bottom-12 right-12 h-36 w-36 rounded-3xl bg-gradient-to-br from-blue-200/60 via-white/40 to-indigo-300/40 blur-2xl animate-float-slow" />
    </div>
  )
}
