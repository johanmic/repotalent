import Image from "next/image"

export default function Logo({ size }: { size: "sm" | "md" | "lg" }) {
  const width = size === "sm" ? 100 : size === "md" ? 200 : 300
  const height = size === "sm" ? 100 : size === "md" ? 200 : 300
  return <Image src="/logo.png" alt="Logo" width={width} height={height} />
}
