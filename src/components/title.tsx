interface TitleProps {
  children: React.ReactNode
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  className?: string
}

const getSizeHtml = (size: TitleProps["size"]): keyof JSX.IntrinsicElements => {
  if (size === "xs") return "h3"
  if (size === "sm") return "h2"
  if (size === "base") return "h1"
  return "h2"
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
} as const

export const Title = ({
  children,
  size = "base",
  className = "",
}: TitleProps) => {
  const sizeClass = sizeClasses[size]
  const HtmlTag = getSizeHtml(size)
  return (
    <HtmlTag
      className={`font-semibold tracking-tight text-gray-900 dark:text-white ${sizeClass} ${className}`}
    >
      {children}
    </HtmlTag>
  )
}
