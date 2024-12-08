"user server"
import OrganizationForm from "./orgForm"
import { getOrganization } from "./actions"
import { Title } from "@/components/title"
const OrgPage = async () => {
  const organization = await getOrganization()
  console.log(organization)
  return (
    <div className="flex">
      <div className="max-w-lg flex flex-col mx-auto w-full">
        <Title>{organization ? "Edit" : "Create"} Organization</Title>
        <OrganizationForm organization={organization} />
      </div>
    </div>
  )
}

export default OrgPage
