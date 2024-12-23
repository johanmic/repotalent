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
import { getUser } from "@actions/user"
// import { SidebarUser } from "@/components/sidebar-user"
import { NavUser } from "@/components/ui/nav-user"
import { cn } from "@/lib/utils"
const items = [
  {
    label: "Home",
    icon: <Icon name="home" />,
    href: "/home",
  },
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
const SidebarComponent = async () => {
  const user = await getUser()
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
                  className={cn(item.comingSoon && "opacity-50")}
                >
                  <SidebarMenuButton asChild>
                    <a href={item.comingSoon ? "#" : item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                      {item.comingSoon && <Badge>Coming Soon</Badge>}
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
