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
import { getUser } from "@actions/user"
// import { SidebarUser } from "@/components/sidebar-user"
import { NavUser } from "@/components/ui/nav-user"
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
    label: "Profile",
    icon: <Icon name="user" />,
    href: "/home/profile",
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
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
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
