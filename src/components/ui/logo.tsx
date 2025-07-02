import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  variant?: "black" | "white"
  size?: "sm" | "md" | "lg"
  className?: string
  href?: string
}

const sizeClasses = {
  sm: "h-6 w-auto",
  md: "h-8 w-auto", 
  lg: "h-12 w-auto"
}

const sizeConfig = {
  sm: { width: 135, height: 34 },
  md: { width: 180, height: 45 },
  lg: { width: 270, height: 68 }
}

export function Logo({ 
  variant = "black", 
  size = "md", 
  className = "",
  href = "/"
}: LogoProps) {
  const logoSrc = variant === "white" ? "/images/logo-white.svg" : "/images/logo-black.svg"
  const { width, height } = sizeConfig[size]
  
  const logoElement = (
    <Image
      src={logoSrc}
      alt="Prostormat"
      width={width}
      height={height}
      className={`${sizeClasses[size]} ${className}`}
      priority
    />
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