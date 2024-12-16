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
  LoaderCircle,
  RotateCw,
  Save,
  MapPin,
  CircleCheck,
  CircleX,
  CircleDot,
  CircleDollarSign,
  Briefcase,
  KeySquare,
  ThumbsUp,
  ThumbsDown,
  Timer,
  Blocks,
  Eye,
  MailPlus,
  Coins,
  User,
  Tag,
  CreditCard,
} from "lucide-react"

export const icons = {
  file: FileCode,
  menu: Menu,
  atom: Atom,
  hexagon: Hexagon,
  moveRight: MoveRight,
  moveLeft: MoveLeft,
  check: Check,
  home: Home,
  organization: Building2,
  spinner: LoaderCircle,
  post: Captions,
  x: X,
  globe: Globe,
  logout: LogOut,
  plus: Plus,
  pen: PenBox,
  rotate: RotateCw,
  save: Save,
  mapPin: MapPin,
  circleCheck: CircleCheck,
  circleX: CircleX,
  circleDot: CircleDot,
  circleDollarSign: CircleDollarSign,
  briefcase: Briefcase,
  keySquare: KeySquare,
  thumbsUp: ThumbsUp,
  thumbsDown: ThumbsDown,
  timer: Timer,
  blocks: Blocks,
  preview: Eye,
  mailPlus: MailPlus,
  coins: Coins,
  user: User,
  tag: Tag,
  creditCard: CreditCard,
}

export const Icon = ({
  name,
  className,
}: {
  name: keyof typeof icons
  className?: string
}) => {
  const Icon = icons[name]

  const additionalClass = name === "spinner" ? "animate-spin" : ""

  return <Icon className={`${className} ${additionalClass}`} />
}

export default Icon
