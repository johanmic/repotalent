import { ElementType } from "react"

interface TextProps {
  as?: ElementType
  children: React.ReactNode
  variant?: "body" | "caption" | "small"
  className?: string
}

const Text = ({
  as: Component = "div",
  children,
  variant = "body",
  className = "",
}: TextProps) => {
  const baseStyles = "text-gray-900 dark:text-gray-100"

  const variantStyles = {
    body: "text-base",
    caption: "text-sm",
    small: "text-xs",
  }

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className}`

  return <Component className={combinedStyles}>{children}</Component>
}

export default Text
