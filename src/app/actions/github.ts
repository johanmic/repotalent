"use server"
// import { App, Octokit } from "octokit"
// // import { Octokit } from "@octokit/rest"
// import { createClient } from "@/utils/supabase/server"

import { createAppAuth } from "@octokit/auth-app"
import { Octokit } from "@octokit/rest"
import { githubRepo, openSourcePackage } from "@prisma/client"
import prisma from "@/store/prisma"
import { getUser as getUserFromSupabase } from "@/utils/supabase/server"

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_PRIVATE_KEY!,
})
import { getUser as getDBUser } from "@actions/user"
export const getInstallation = async (installationId: number) => {
  const { user } = await getUserFromSupabase()
  if (!user) {
    throw new Error("User not found")
  }
  const dbUser = await getDBUser()
  if (!dbUser) {
    throw new Error("User not found")
  }
  const octokit = new Octokit({ auth: dbUser.githubInstallationId })
  const installation = await octokit.rest.apps.getInstallation({
    installation_id: installationId,
  })
  return installation
}

export interface DBGithubRepo extends githubRepo {
  openSourcePackage?: openSourcePackage
}

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  owner: string
  private: boolean
  description: string | null
  url: string
  default_branch: string
  updated_at: string
  created_at: string
}
export interface GithubOrg {
  login: string
  id: number
  name?: string
  description: string | null
  avatar_url: string
  location?: string | null
  url: string
}

export const getGithubUser = async () => {
  return null
}

interface CreateGithubInstallationParams {
  installationId: number
}

export async function createGithubInstallation({
  installationId,
}: CreateGithubInstallationParams) {
  const { user } = await getUserFromSupabase()
  if (!user) {
    throw new Error("User not found")
  }
  const { token } = await auth({ type: "app" })
  const octokit = new Octokit({ auth: token })
  const { data: installation } = await octokit.rest.apps.getInstallation({
    installation_id: installationId,
  })
  if (!installation.account) {
    throw new Error("Installation not found")
  }
  const accountLogin =
    "login" in installation.account ? installation.account.login : null

  if (accountLogin !== user.user_metadata.user_name) {
    throw new Error("Installation does not match user")
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      githubInstallationId: installationId,
    },
  })
}

export const listUserRepos = async () => {
  const user = await getDBUser()
  if (!user.githubInstallationId) {
    throw new Error("No GitHub installation found")
  }

  // Get installation access token
  const installationAuth = await auth({
    type: "installation",
    installationId: user.githubInstallationId,
  })

  // Create Octokit instance with installation token
  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  // List all repositories the installation has access to
  const { data: repos } =
    await octokit.rest.apps.listReposAccessibleToInstallation({
      per_page: 100,
      sort: "updated",
      direction: "asc",
    })

  return repos.repositories
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      fullName: repo.full_name,
      private: repo.private,
      description: repo.description,
      url: repo.html_url,
      default_branch: repo.default_branch,
      updated_at: repo.updated_at,
    }))
    .sort((a, b) => {
      const dateA = a.updated_at ?? ""
      const dateB = b.updated_at ?? ""
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
}

export const getRepo = async ({
  owner,
  repo,
}: {
  owner: string
  repo: string
}) => {
  const user = await getDBUser()
  if (!user.githubInstallationId) {
    throw new Error("No GitHub installation found")
  }

  const installationAuth = await auth({
    type: "installation",
    installationId: user.githubInstallationId,
  })

  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo,
  })

  return repoData
}

export const listRepoFolders = async ({
  owner,
  repo,
  path = "",
}: {
  owner: string
  repo: string
  path?: string
}) => {
  const user = await getDBUser()
  if (!user.githubInstallationId) {
    throw new Error("No GitHub installation found")
  }
  const installationAuth = await auth({
    type: "installation",
    installationId: user.githubInstallationId,
  })
  const octokit = new Octokit({
    auth: installationAuth.token,
  })
  const { data: contents } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  })
  return contents
}

export const listRepoFiles = async (path: string = "") => {
  const user = await getDBUser()
  if (!user.githubInstallationId) {
    throw new Error("No GitHub installation found")
  }

  // Get the first repo
  const repos = await listUserRepos()
  if (!repos.length) {
    throw new Error("No repositories found")
  }
  const repo = repos[0]

  // Get installation access token
  const installationAuth = await auth({
    type: "installation",
    installationId: user.githubInstallationId,
  })

  // Create Octokit instance with installation token
  const octokit = new Octokit({
    auth: installationAuth.token,
  })

  // Get repository contents
  const [owner, repoName] = repo.fullName.split("/")
  const { data: contents } = await octokit.rest.repos.getContent({
    owner,
    repo: repoName,
    path,
  })

  // Handle array response (directory contents)
  if (Array.isArray(contents)) {
    return contents.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type as "file" | "dir",
      size: item.size,
      sha: item.sha,
      url: item.html_url,
      downloadUrl: item.download_url,
    }))
  }

  // Handle single file response
  return [
    {
      name: contents.name,
      path: contents.path,
      type: contents.type as "file" | "dir",
      size: contents.size,
      sha: contents.sha,
      url: contents.html_url,
      downloadUrl: contents.download_url,
    },
  ]
}

interface GitHubFileContent {
  content?: string
  encoding?: string
  size: number
  name: string
  path: string
  sha: string
  url: string
  git_url: string
  html_url: string
  download_url: string | null
  type: "file" | "dir"
}

export const getFileContent = async ({
  owner,
  repo,
  path,
}: {
  owner: string
  repo: string
  path: string
}) => {
  const user = await getDBUser()
  if (!user.githubInstallationId) {
    throw new Error("No GitHub installation found")
  }
  const installationAuth = await auth({
    type: "installation",
    installationId: user.githubInstallationId,
  })
  const octokit = new Octokit({
    auth: installationAuth.token,
  })
  const { data } = (await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  })) as { data: GitHubFileContent }

  if (Array.isArray(data) || !data.content) {
    throw new Error("Not a file or no content available")
  }

  // Decode Base64 content to a readable string
  const cleanContent = data.content.replace(/\n/g, "")
  const decodedContent = Buffer.from(cleanContent, "base64").toString("utf-8")

  return decodedContent
}

export const removeGithubApp = async () => {
  const user = await getDBUser()
  if (!user.githubInstallationId) {
    throw new Error("No GitHub installation found")
  }
  const octokit = new Octokit({ auth: user.githubInstallationId })
  await octokit.rest.apps.deleteInstallation({
    installation_id: user.githubInstallationId,
  })
  await prisma.user.update({
    where: { id: user.id },
    data: {
      githubInstallationId: null,
    },
  })
}
