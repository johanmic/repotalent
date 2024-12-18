import Image from "next/image"
import Link from "next/link"
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
  noLink = false,
}: {
  size: keyof LogoSizes
  className?: string
  icon?: boolean
  noLink?: boolean
}) => {
  const dimensions = logoSizes[size]
  const logo = (
    <Image
      src={icon ? "/logoIcon.png" : "/logo.png"}
      alt="Logo"
      {...dimensions}
      className={className}
      priority
    />
  )
  if (noLink) {
    return logo
  }
  return <Link href="/">{logo}</Link>
}

export default Logo
