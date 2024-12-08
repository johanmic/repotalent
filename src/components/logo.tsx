import Image from "next/image"

export default function Logo({
  size,
  className,
  icon = false,
}: {
  size: "xs" | "sm" | "md" | "lg"
  className?: string
  icon?: boolean
}) {
  const width =
    size === "xs" ? 50 : size === "sm" ? 100 : size === "md" ? 150 : 200
  const height =
    size === "xs" ? 50 : size === "sm" ? 100 : size === "md" ? 150 : 200
  return (
    <Image
      src={icon ? "/logoIcon.png" : "/logo.png"}
      alt="Logo"
      width={width}
      height={height}
      className={className}
    />
  )
}
