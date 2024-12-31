import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

const Layout = async ({
  children,
  sidebar,
}: {
  children: React.ReactNode
  sidebar: React.ReactNode
}) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarTrigger />
      <main className="w-full p-4 md:p-0">{children}</main>
    </SidebarProvider>
  )
}

export default Layout
