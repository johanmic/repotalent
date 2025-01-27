import React, { ReactNode, ElementType } from "react"

interface TitleProps {
  children: ReactNode
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
  className?: string
}

const getSizeHtml = (size: TitleProps["size"]): "h1" | "h2" | "h3" => {
  switch (size) {
    case "xs":
      return "h3"
    case "sm":
    case "base":
      return "h2"
    default:
      return "h1"
  }
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
  size = "xl",
  className = "",
  ...props
}: TitleProps) => {
  const sizeClass = sizeClasses[size]
  const HtmlTag: ElementType = getSizeHtml(size)

  const combinedStyles = `font-semibold tracking-tight text-gray-900 dark:text-white ${sizeClass} ${className}`

  return (
    <HtmlTag className={combinedStyles} {...props}>
      {children}
    </HtmlTag>
  )
}
