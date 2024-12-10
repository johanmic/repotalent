import Image from "next/image"

interface LogoSizes {
  xs: { width: 50; height: 50 }
  sm: { width: 100; height: 100 }
  md: { width: 150; height: 150 }
  lg: { width: 200; height: 200 }
}

const logoSizes: LogoSizes = {
  xs: { width: 50, height: 50 },
  sm: { width: 100, height: 100 },
  md: { width: 150, height: 150 },
  lg: { width: 200, height: 200 },
} as const

export const Logo = ({
  size,
  className,
  icon = false,
}: {
  size: keyof LogoSizes
  className?: string
  icon?: boolean
}) => {
  const dimensions = logoSizes[size]

  return (
    <Image
      src={icon ? "/logoIcon.png" : "/logo.png"}
      alt="Logo"
      {...dimensions}
      className={className}
      priority
    />
  )
}

export default Logo
