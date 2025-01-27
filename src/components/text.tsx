import { HTMLAttributes } from "react"

interface TextProps
  extends HTMLAttributes<
    HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
  > {
  as?: "div" | "p" | "span"
  variant?: "body" | "caption" | "small" | "sm" | "xs" | "lg"
  light?: boolean
}

export const Text = ({
  as: Component = "div",
  variant = "body",
  className = "",
  light = false,
  ...props
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

  return <Component className={combinedStyles} {...props} />
}

export default Text
