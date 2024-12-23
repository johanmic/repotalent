"user server"
import type { GithubOrg } from "@/app/actions/github"
import GithubOrgPicker from "@/components/github-org-picker"
import { Title } from "@/components/title"
import { getUser } from "@actions/user"
import { listUserRepos } from "@actions/github"
import { getOrganization } from "@actions/org"
import OrganizationForm from "./orgForm"
const OrgPage = async () => {
  const user = await getUser()
  console.log("user222", user)
  const organization = await getOrganization()
  const hasGithub = user?.githubInstallationId
  console.log("hasGithub", hasGithub)
  let orgs: GithubOrg[] = []
  console.log("orgs", orgs)
  const repos = await listUserRepos()
  console.log("repos", repos)
  return (
    <div className="flex">
      <div className="max-w-xl flex flex-col mx-auto w-full">
        <Title>{organization ? "Edit" : "Create"} Organization</Title>
        {/* {!organization && hasGithub && <GithubOrgPicker orgs={orgs} />} */}
        <OrganizationForm organization={organization} />
      </div>
    </div>
  )
}

export default OrgPage
