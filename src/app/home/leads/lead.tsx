import { getLeadsForJob, Contributor } from "@/app/actions/leads"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  StarIcon,
  MessageSquare,
  MapPin,
  Building2,
  Globe,
  Github,
  Twitter,
  Copy,
  Mail,
} from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Icon } from "@/components/icon"
import { useCopyToClipboard } from "@uidotdev/usehooks"
import { toast } from "sonner"
// Initialize dayjs relative time plugin
dayjs.extend(relativeTime)

const Lead = ({ contributor }: { contributor: Contributor }) => {
  const [_, copyToClipboard] = useCopyToClipboard()

  const handleCopyEmail = () => {
    if (contributor.email) {
      copyToClipboard(contributor.email)
      toast.success("Email copied to clipboard")
    }
  }

  // Helper function to ensure URL has https
  const formatUrl = (url: string) => {
    if (!url) return ""
    return url.startsWith("http") ? url : `https://${url}`
  }

  return (
    <div className="w-full max-w-2xl rounded-lg mt-8">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={contributor.avatar || ""}
            alt={contributor.name || ""}
          />
          <AvatarFallback>
            {contributor.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold mb-2">{contributor.name}</h3>
            <div className="flex gap-2">
              {contributor.name && (
                <a
                  href={`https://github.com/${contributor.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {contributor.twitter && (
                <a
                  href={`https://twitter.com/${contributor.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {contributor.blog && (
                <a
                  href={formatUrl(contributor.blog)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            {contributor.locationRaw && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{contributor.locationRaw}</span>
              </div>
            )}
            {contributor.company && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{contributor.company}</span>
              </div>
            )}
            {contributor.hireable && (
              <Badge variant="outline" className="text-xs">
                Available for hire
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        {contributor.bio && (
          <p className="text-muted-foreground">{contributor.bio}</p>
        )}

        <div className="flex gap-6">
          <div className="text-sm">
            <span className="font-semibold">{contributor.followers}</span>
            <span className="text-muted-foreground ml-1">followers</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">{contributor.following}</span>
            <span className="text-muted-foreground ml-1">following</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold">{contributor.publicRepos}</span>
            <span className="text-muted-foreground ml-1">repositories</span>
          </div>
        </div>
        {contributor.email && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEmail}
            className="ml-auto"
          >
            <Mail className="h-4 w-4 mr-1" />
            {contributor.email}
            <Copy className="h-3 w-3 ml-2" />
          </Button>
        )}
        {contributor.contributions?.map((contribution) => (
          <div key={contribution.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              {contribution.githubRepo.logo && (
                <img
                  src={contribution.githubRepo.logo}
                  alt={contribution.githubRepo.name || ""}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <h4 className="font-semibold">{contribution.githubRepo.name}</h4>
              <Badge variant="secondary">
                {contribution.contributions} contrib
                {contribution.contributions > 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              {contribution.githubRepo.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-xs">
                <Icon name="star" className="h-4 w-4" />{" "}
                {contribution.githubRepo.stars}
              </span>
              <span className="flex items-center gap-1 font-semibold text-xs">
                <Icon name="gitFork" className="h-4 w-4" />{" "}
                {contribution.githubRepo.forks}
              </span>
              <span className="flex items-center gap-1 font-semibold text-xs">
                <Icon name="code" className="h-4 w-4" />{" "}
                {contribution.githubRepo.language}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="mt-6 pt-4 border-t space-y-4">
        {/* Actions Row */}
        <div className="flex gap-2 pb-3 border-b">
          <Button variant="outline" size="sm">
            <StarIcon className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Comment
          </Button>
        </div>

        {/* Links Row */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {contributor.name && (
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={`https://github.com/${contributor.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-1" />
                  GitHub
                </a>
              </Button>
            )}
            {contributor.twitter && (
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={`https://twitter.com/${contributor.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4 mr-1" />
                  Twitter
                </a>
              </Button>
            )}
            {contributor.blog && (
              <Button variant="ghost" size="sm" asChild>
                <a
                  href={formatUrl(contributor.blog)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Blog
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-4 text-right">
        Added {dayjs(contributor.createdAt).fromNow()}
      </div>
    </div>
  )
}

export default Lead
