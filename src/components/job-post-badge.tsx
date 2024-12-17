import Icon, { icons } from "./icon"
import { Badge } from "./ui/badge"
const ICON_SIZE = 16
const JobPostBadge = ({
  icon,
  text,
  value,
  bg = "",
  booleanValue,
}: {
  icon: keyof typeof icons
  text: string
  value: string | boolean | null | number
  bg?: string
  booleanValue?: boolean
}) => {
  return (
    <div
      className={`flex justify-between items-center ${
        bg ? `bg-${bg}` : ""
      } p-2 rounded-md`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-40" name={icon} />
        <p className="text-sm">{text}</p>
      </div>
      <div>
        {booleanValue ? (
          <Icon
            className={`h-4 w-4 ${
              value ? "text-success" : "opacity-80 text-rose-300"
            }`}
            name={value ? "circleCheck" : "circleX"}
          />
        ) : (
          <p className="text-sm">{value || "n/a"}</p>
        )}
      </div>
    </div>
  )
}

export default JobPostBadge
