import { getUser } from "@/app/actions/user"
import { redirect } from "next/navigation"
const Home = async () => {
  // const user = await getUser()
  // if (!user?.organization) {
  //   return redirect("/app/org")
  // }
  return <div>Home</div>
}

export default Home
