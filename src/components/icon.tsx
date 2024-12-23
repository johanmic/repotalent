import {
  Atom,
  Blocks,
  Briefcase,
  Building2,
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDollarSign,
  CircleDot,
  CircleX,
  Coins,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FileCode,
  FileText,
  Folder,
  FolderUp,
  Globe,
  Hexagon,
  Home,
  KeySquare,
  LoaderCircle,
  LogOut,
  MailPlus,
  MapPin,
  Menu,
  MoveLeft,
  MoveRight,
  Package,
  PenBox,
  Plus,
  RefreshCw,
  RotateCw,
  Save,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Timer,
  User,
  X,
} from "lucide-react"

export const icons = {
  atom: Atom,
  blocks: Blocks,
  briefcase: Briefcase,
  check: Check,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  circle: Circle,
  circleCheck: CircleCheck,
  circleDollarSign: CircleDollarSign,
  circleDot: CircleDot,
  circleX: CircleX,
  coins: Coins,
  copy: Copy,
  creditCard: CreditCard,
  eye: Eye,
  eyeOff: EyeOff,
  file: FileCode,
  folder: Folder,
  folderUp: FolderUp,
  globe: Globe,
  hexagon: Hexagon,
  home: Home,
  keySquare: KeySquare,
  logout: LogOut,
  mailPlus: MailPlus,
  mapPin: MapPin,
  menu: Menu,
  moveLeft: MoveLeft,
  moveRight: MoveRight,
  organization: Building2,
  package: Package,
  pdf: FileText,
  pen: PenBox,
  plus: Plus,
  post: Captions,
  preview: Eye,
  refresh: RefreshCw,
  rotate: RotateCw,
  save: Save,
  spinner: LoaderCircle,
  tag: Tag,
  thumbsDown: ThumbsDown,
  thumbsUp: ThumbsUp,
  timer: Timer,
  user: User,
  x: X,
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
