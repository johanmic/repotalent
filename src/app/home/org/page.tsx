"user server"
import type { GithubOrg } from "@/app/actions/github"
import GithubOrgPicker from "@/components/github-org-picker"
import { Title } from "@/components/title"
import { getUser } from "@actions/user"
import { listUserRepos } from "@actions/github"
import { getOrganization } from "@actions/org"
import OrganizationForm from "./orgForm"
const OrgPage = async () => {
  // const user = await getUser()
  const organization = await getOrganization()
  // const hasGithub = user?.githubInstallationId
  // const repos = await listUserRepos()
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
