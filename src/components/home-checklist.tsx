import { Button } from "@/components/ui/button"
import { Icon, icons } from "@/components/icon"
import AppIcon from "@/components/appIcon"
import Link from "next/link"
const GithubAppInstall = ({ installed }: { installed: boolean }) => {
  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded-md justify-between">
      RepoTalent Github App{" "}
      <Link href="https://github.com/apps/repotalent">
        <Button className="bg-green-700 text-white">
          {installed ? (
            <Icon name="check" className="w-4 h-4" />
          ) : (
            <AppIcon name="github" className="w-4 h-4" />
          )}
          {installed ? "Installed" : "Install"}
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
  icon,
}: {
  text: string
  action: string
  href: string
  locked?: boolean
  icon?: string
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
          {icon && (
            <Icon name={icon as keyof typeof icons} className="w-4 h-4" />
          )}
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
        <Icon
          name={status ? "circleCheck" : "circle"}
          className={`w-5 h-5 ${
            status
              ? "text-green-600 dark:text-green-500"
              : "text-gray-400 dark:text-gray-500"
          }`}
        />
        <p
          className={`text-sm ${
            status ? "font-medium" : "text-muted-foreground"
          }`}
        >
          {text}
        </p>
      </div>
      {component}
    </div>
  )
}
export const HomeChecklist = ({
  hasApp,
  hasOrg,
  hasJob,
}: {
  hasApp: boolean
  hasOrg: boolean
  hasJob: boolean
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
      component: <GithubAppInstall installed={hasApp} />,
    },
    {
      status: hasOrg,
      text: hasOrg ? "Organization created" : "Create an organization",
      action: hasOrg ? "View Organization" : "Create an organization",
      locked: !hasApp,
      component: (
        <GenericAction
          text={hasOrg ? "View Organization" : "Create an organization"}
          action={hasOrg ? "View Organization" : "Create an organization"}
          href={hasOrg ? "/home/org" : "/home/org"}
          icon={hasOrg ? "check" : "plus"}
        />
      ),
    },
    {
      status: hasJob,
      text: hasJob ? "Job posted" : "Post your first job",
      action: hasJob ? "View Jobs" : "Post your first job",
      locked: !hasOrg && !hasApp,
      component: (
        <GenericAction
          text={hasJob ? "View Jobs" : "Post your first job"}
          action={hasJob ? "View Jobs" : "Post your first job"}
          href={hasJob ? "/home/jobs" : "/home/create"}
          icon={hasJob ? "check" : "plus"}
        />
      ),
    },
  ]
  return (
    <div className="flex flex-col gap-2 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold">Setup your account</h2>
      {checklistItems.map((item) => (
        <CheckListItem key={item.text} {...item} />
      ))}
    </div>
  )
}

export default HomeChecklist
