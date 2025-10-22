"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageHeroVariant = "default" | "soft" | "plain"
type PageHeroAlign = "center" | "left"
type PageHeroSize = "lg" | "md"
type PageHeroTone = "blue" | "rose" | "emerald" | "amber"

interface PageHeroProps {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  align?: PageHeroAlign
  variant?: PageHeroVariant
  size?: PageHeroSize
  tone?: PageHeroTone
  className?: string
  containerClassName?: string
  children?: ReactNode
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
  tone = "blue",
  className,
  containerClassName,
  children,
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
      <BackgroundDecor tone={tone} />

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

        {children ? (
          <div className="mt-8 sm:mt-10">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  )
}

type ToneConfig = {
  radialTop: string
  radialBottom: string
  grid: string
  blobs: Array<
    {
      className: string
      backgroundColor?: string
      backgroundImage?: string
    }
  >
}

const toneConfigs: Record<PageHeroTone, ToneConfig> = {
  blue: {
    radialTop: "rgba(59,130,246,0.12)",
    radialBottom: "rgba(124,58,237,0.08)",
    grid: "rgba(99,102,241,0.08)",
    blobs: [
      {
        className: "absolute -top-16 left-10 h-48 w-48 rounded-full blur-3xl animate-float-slow",
        backgroundColor: "rgba(191,219,254,0.5)",
      },
      {
        className: "absolute top-1/4 right-1/4 h-40 w-40 rounded-full blur-3xl animate-float-medium",
        backgroundColor: "rgba(199,210,254,0.5)",
      },
      {
        className: "absolute bottom-0 left-1/3 h-52 w-52 rounded-full blur-3xl animate-float-fast",
        backgroundColor: "rgba(221,214,254,0.4)",
      },
      {
        className: "absolute bottom-12 right-12 h-36 w-36 rounded-3xl blur-2xl animate-float-slow",
        backgroundImage: "linear-gradient(to bottom right, rgba(191,219,254,0.6), rgba(255,255,255,0.4), rgba(165,180,252,0.4))",
      },
    ],
  },
  rose: {
    radialTop: "rgba(244,114,182,0.12)",
    radialBottom: "rgba(236,72,153,0.08)",
    grid: "rgba(244,114,182,0.08)",
    blobs: [
      {
        className: "absolute -top-16 left-10 h-48 w-48 rounded-full blur-3xl animate-float-slow",
        backgroundColor: "rgba(251,207,232,0.55)",
      },
      {
        className: "absolute top-1/4 right-1/4 h-40 w-40 rounded-full blur-3xl animate-float-medium",
        backgroundColor: "rgba(244,114,182,0.3)",
      },
      {
        className: "absolute bottom-0 left-1/3 h-52 w-52 rounded-full blur-3xl animate-float-fast",
        backgroundColor: "rgba(251,191,207,0.4)",
      },
      {
        className: "absolute bottom-12 right-12 h-36 w-36 rounded-3xl blur-2xl animate-float-slow",
        backgroundImage: "linear-gradient(to bottom right, rgba(244,114,182,0.3), rgba(255,255,255,0.4), rgba(249,168,212,0.45))",
      },
    ],
  },
  emerald: {
    radialTop: "rgba(16,185,129,0.12)",
    radialBottom: "rgba(5,150,105,0.08)",
    grid: "rgba(16,185,129,0.08)",
    blobs: [
      {
        className: "absolute -top-16 left-10 h-48 w-48 rounded-full blur-3xl animate-float-slow",
        backgroundColor: "rgba(187,247,208,0.55)",
      },
      {
        className: "absolute top-1/4 right-1/4 h-40 w-40 rounded-full blur-3xl animate-float-medium",
        backgroundColor: "rgba(110,231,183,0.4)",
      },
      {
        className: "absolute bottom-0 left-1/3 h-52 w-52 rounded-full blur-3xl animate-float-fast",
        backgroundColor: "rgba(167,243,208,0.45)",
      },
      {
        className: "absolute bottom-12 right-12 h-36 w-36 rounded-3xl blur-2xl animate-float-slow",
        backgroundImage: "linear-gradient(to bottom right, rgba(16,185,129,0.25), rgba(255,255,255,0.4), rgba(52,211,153,0.35))",
      },
    ],
  },
  amber: {
    radialTop: "rgba(251,191,36,0.12)",
    radialBottom: "rgba(245,158,11,0.08)",
    grid: "rgba(251,191,36,0.08)",
    blobs: [
      {
        className: "absolute -top-16 left-10 h-48 w-48 rounded-full blur-3xl animate-float-slow",
        backgroundColor: "rgba(254,243,199,0.6)",
      },
      {
        className: "absolute top-1/4 right-1/4 h-40 w-40 rounded-full blur-3xl animate-float-medium",
        backgroundColor: "rgba(253,224,71,0.35)",
      },
      {
        className: "absolute bottom-0 left-1/3 h-52 w-52 rounded-full blur-3xl animate-float-fast",
        backgroundColor: "rgba(254,240,138,0.45)",
      },
      {
        className: "absolute bottom-12 right-12 h-36 w-36 rounded-3xl blur-2xl animate-float-slow",
        backgroundImage: "linear-gradient(to bottom right, rgba(251,191,36,0.28), rgba(255,255,255,0.4), rgba(251,146,60,0.32))",
      },
    ],
  },
}

function BackgroundDecor({ tone }: { tone: PageHeroTone }) {
  const config = toneConfigs[tone]

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at top, ${config.radialTop}, transparent 55%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at bottom, ${config.radialBottom}, transparent 55%)` }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `linear-gradient(${config.grid} 1px, transparent 1px), linear-gradient(90deg, ${config.grid} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {config.blobs.map((blob, index) => (
        <div
          key={index}
          className={blob.className}
          style={{
            backgroundColor: blob.backgroundColor,
            backgroundImage: blob.backgroundImage,
          }}
        />
      ))}
    </div>
  )
}
