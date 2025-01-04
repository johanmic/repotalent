"use server"
import { Title } from "@/components/title"
import { getOrganization } from "@actions/org"
import OrganizationForm from "./orgForm"
const OrgPage = async () => {
  const organization = await getOrganization()
  return (
    <div className="flex">
      <div className="max-w-xl flex flex-col mx-auto w-full">
        <Title>{organization ? "Edit" : "Create"} Organization</Title>
        <OrganizationForm organization={organization} />
      </div>
    </div>
  )
}

export default OrgPage
