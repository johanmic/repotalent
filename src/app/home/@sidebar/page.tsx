import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Logo from "@/components/logo"
import Icon from "@/components/icon"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getUser, getLeadsEnabled, updateLastSeen } from "@actions/user"
import { Separator } from "@/components/ui/separator"
import { getUserSubscriptionFromDB } from "@actions/subscriptions"
// import { SidebarUser } from "@/components/sidebar-user"
import { NavUser } from "@/components/ui/nav-user"
import { cn } from "@/lib/utils"

type SidebarItem = {
  label: string
  icon: React.ReactNode
  href?: string
  comingSoon?: boolean
  pro?: boolean
}

const SidebarComponent = async () => {
  const user = await getUser()
  if (user) {
    await updateLastSeen(user.id)
  }
  const items: SidebarItem[] = [
    // {
    //   label: "Home",
    //   icon: <Icon name="home" />,
    //   href: "/home",
    // },
    {
      label: "Jobs",
      icon: <Icon name="post" />,
      href: "/home/jobs",
    },
    {
      label: "Organization",
      icon: <Icon name="organization" />,
      href: "/home/org",
    },
    {
      label: "Candidates",
      icon: <Icon name="user" />,
      comingSoon: true,
    },
  ]
  const leadsEnabled = await getLeadsEnabled()
  if (leadsEnabled) {
    items.push({
      label: "Leads",
      icon: <Icon name="user" />,
      href: "/home/leads",
    })
  } else {
    items.push({
      label: "Leads",
      icon: <Icon name="user" />,
      pro: true,
    })
  }
  return (
    <div>
      <Sidebar>
        <SidebarHeader>
          <Logo size="md" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.label}
                  className={cn((item.comingSoon || item.pro) && "opacity-50")}
                >
                  <SidebarMenuButton asChild>
                    <a href={item.comingSoon ? "#" : item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                      {item.comingSoon && <Badge>Coming Soon</Badge>}
                      {item.pro && (
                        <Badge>
                          <Icon name="lock" className="h-3 w-3 mr-1" /> Pro
                          Feature
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <Button variant="outline" asChild>
              <Link href="/home/create">
                <Icon name="plus" /> Create Job Description
              </Link>
            </Button>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Separator />
          <Link
            className="flex flex-row text-xs pl-2 items-center justify-between"
            href="/home/purchase"
          >
            Credits:{" "}
            <Badge variant="outline">
              {user?.creditsInfo?.creditsAvailable}
            </Badge>
          </Link>
          <NavUser user={user} />
          {/* <Button variant="outline" asChild>
            <Link href="/home/logout">
              <Icon name="logout" /> Logout
            </Link>
          </Button> */}
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}

export default SidebarComponent
