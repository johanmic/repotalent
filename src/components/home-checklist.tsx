import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
import AppIcon from "@/components/appIcon"
import Link from "next/link"
const GithubAppInstall = () => {
  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded-md justify-between">
      RepoTalent Github App{" "}
      <Link href="https://github.com/apps/repotalent">
        <Button className="bg-green-700 text-white">
          <AppIcon name="github" className="w-4 h-4" />
          Install
        </Button>
      </Link>
    </div>
  )
}

const GenericAction = ({
  text,
  action,
  href,
  locked,
}: {
  text: string
  action: string
  href: string
  locked?: boolean
}) => {
  return (
    <div
      className={`flex items-center gap-2 bg-muted p-2 rounded-md justify-between ${
        locked ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {text}
      <Link href={locked ? "#" : href}>
        <Button variant="default" disabled={locked}>
          {action}
        </Button>
      </Link>
    </div>
  )
}

const CheckListItem = ({
  status,
  text,
  action,
  component,
}: {
  status: boolean
  text: string
  action: string
  component?: React.ReactNode
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 my-4">
        <Icon name={status ? "circleCheck" : "circle"} className="w-4 h-4" />
        <p className="text-sm italic">{text}</p>
      </div>
      {component}
    </div>
  )
}
export const HomeChecklist = ({
  hasApp,
  hasOrg,
}: {
  hasApp: boolean
  hasOrg: boolean
}) => {
  const checklistItems = [
    {
      status: true,
      text: "Create RepoTalent Account",
      action: "Create Account",
    },
    {
      status: hasApp,
      text: "Install the app on your Github organization",
      action: "Install the app on your Github organization",
      component: <GithubAppInstall />,
    },
    {
      status: hasOrg,
      text: "Create an organization",
      action: "Create an organization",
      locked: !hasApp,
      component: (
        <GenericAction
          text="Create an organization"
          action="Create an organization"
          href="/home/org"
        />
      ),
    },
    {
      status: false,
      text: "Post your first job",
      action: "Post your first job",
      locked: !hasOrg && !hasApp,
      component: (
        <GenericAction
          text="Post your first job"
          action="Post your first job"
          href="/home/job"
        />
      ),
    },
  ]
  return (
    <div className="flex flex-col gap-2 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">Checklist</h2>
      {checklistItems.map((item) => (
        <CheckListItem key={item.text} {...item} />
      ))}
    </div>
  )
}

export default HomeChecklist
