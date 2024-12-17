import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/icon"
export const JobsMenu = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Button>
            <Icon name="mapPin" />
            All Jobs
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
