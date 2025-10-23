import Link from "next/link"

interface LogoProps {
  variant?: "black" | "white"
  size?: "sm" | "md" | "lg"
  className?: string
  href?: string | null
}

const sizeClasses = {
  sm: "h-6 w-auto",
  md: "h-8 w-auto",
  lg: "h-12 w-auto",
}

const sizeConfig = {
  sm: { width: 135, height: 34 },
  md: { width: 180, height: 45 },
  lg: { width: 270, height: 68 },
}

export function Logo({
  variant = "black",
  size = "md",
  className = "",
  href = "/",
}: LogoProps) {
  const { width, height } = sizeConfig[size]
  const fill = variant === "white" ? "#FFFFFF" : "#000000"

  const logoElement = (
    <svg
      viewBox="0 0 800 200"
      width={width}
      height={height}
      className={`${sizeClasses[size]} ${className}`}
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label="Prostormat"
    >
      <text
        x="0"
        y="130"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        fontSize="120"
        fontWeight="700"
        textAnchor="start"
        fill={fill}
      >
        prostormat.
      </text>
    </svg>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}
