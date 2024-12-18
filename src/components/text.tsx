import { ElementType } from "react"

interface TextProps {
  as?: ElementType
  children: React.ReactNode
  variant?: "body" | "caption" | "small" | "sm" | "xs" | "lg"
  className?: string
  light?: boolean
}

export const Text = ({
  as: Component = "div",
  children,
  variant = "body",
  className = "",
  light = false,
}: TextProps) => {
  const baseStyles =
    "leading-relaxed tracking-tight text-muted-foreground max-w-md text-left text-gray-900 dark:text-gray-100"

  const variantStyles = {
    body: "text-base",
    caption: "text-sm",
    small: "text-xs",
    sm: "text-sm",
    xs: "text-xs",
    lg: "text-lg",
  }

  const combinedStyles = `${baseStyles} ${
    variantStyles[variant]
  } ${className} ${light ? "opacity-50" : ""}`

  return <Component className={combinedStyles}>{children}</Component>
}

export default Text
