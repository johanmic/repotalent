import {
  Home,
  Building2,
  Captions,
  FileCode,
  Menu,
  Atom,
  Hexagon,
  MoveRight,
  MoveLeft,
  Check,
  Globe,
  LogOut,
  Plus,
  X,
  PenBox,
} from "lucide-react"

const icons = {
  file: FileCode,
  menu: Menu,
  atom: Atom,
  hexagon: Hexagon,
  moveRight: MoveRight,
  moveLeft: MoveLeft,
  check: Check,
  home: Home,
  organization: Building2,
  post: Captions,
  x: X,
  globe: Globe,
  logout: LogOut,
  plus: Plus,
  pen: PenBox,
}

export default function Icon({
  name,
  className,
}: {
  name: keyof typeof icons
  className?: string
}) {
  const Icon = icons[name]
  return <Icon className={className} />
}
